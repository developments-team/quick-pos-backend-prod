import { exec } from 'child_process';
import { promisify } from 'util';
import { UserType, AccountGroup, AccountType, } from '../../generated/prisma/client.js';
import { globalPrisma, getTenantClient } from '../../lib/prisma.js';
import AppError from '../../utils/appError.js';
import { toSlug } from '../../utils/formatters.js';
import { encrypt } from '../../utils/crypto.js';
import { sendMail } from '../../config/emailService.js';
import genPwd from '../../utils/genPwd.js';
import { htmlTemplate } from '../../config/emailService.js';
import { deleteImage } from '../../config/cloudinaryConfig.js';
const execAsync = promisify(exec);
export async function getAllTenants() {
    return globalPrisma.tenant.findMany();
}
export async function getTenantById({ id }) {
    const row = await globalPrisma.tenant.findUnique({ where: { id } });
    if (!row)
        throw new AppError('No Tenant record found with that ID', 404);
    return row;
}
export async function createTenant(data) {
    const { name, createdById, businessType, planId, planExpiry, ...rest } = data;
    const slug = toSlug(`tenant_${name}`);
    if (!slug)
        throw new AppError('Invalid Tenant name provided', 400);
    const plan = planId
        ? await globalPrisma.plan.findUnique({ where: { id: planId } })
        : await globalPrisma.plan.findFirst();
    if (!plan)
        throw new AppError('there is no plans please create one', 500);
    const row = await globalPrisma.tenant.create({
        data: {
            name,
            slug,
            businessType: businessType,
            ...rest,
            planId: plan.id,
            planExpiry: planExpiry ? new Date(planExpiry) : undefined,
            createdById,
        },
    });
    if (!row || !row.id)
        throw new AppError('Failed to create tenant', 500);
    await globalPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${row.slug}"`);
    const tenantUrl = `${process.env.DATABASE_URL}?schema=${row.slug}`;
    await execAsync(`npx prisma migrate deploy`, { env: { ...process.env, DATABASE_URL: tenantUrl } });
    const password = genPwd();
    const usersExists = (await globalPrisma.user.findFirst({ where: { userTenants: { some: { tenantId: row.id } } } })) !== null;
    if (!usersExists) {
        await globalPrisma.user.create({
            data: {
                email: row.email,
                password: await encrypt(password),
                userType: UserType.TENANT,
                userTenants: {
                    create: {
                        tenantId: row.id,
                        roleId: plan.roleId,
                    },
                },
            },
        });
    }
    await sendMail({
        to: row.email,
        subject: 'Your QuickPOS Account Password',
        html: htmlTemplate(password),
    });
    const db = getTenantClient(row.slug);
    await initializeTenantData(db, row);
    return row;
}
export async function createTenantPublic(data) {
    const { name, email, password, businessType, planId, ...rest } = data;
    const slug = toSlug(`tenant_${name}`);
    if (!slug)
        throw new AppError('Invalid Tenant name provided', 400);
    const existingTenant = await globalPrisma.tenant.findUnique({ where: { name } });
    if (existingTenant)
        throw new AppError('A tenant with this name already exists', 409);
    const existingUser = await globalPrisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new AppError('A user with this email already exists', 409);
    const plan = planId
        ? await globalPrisma.plan.findUnique({ where: { id: planId } })
        : await globalPrisma.plan.findFirst();
    if (!plan)
        throw new AppError('There are no plans available, please contact support', 500);
    const row = await globalPrisma.tenant.create({
        data: {
            name,
            slug,
            email,
            businessType: businessType,
            ...rest,
            planId: plan.id,
        },
    });
    if (!row || !row.id)
        throw new AppError('Failed to create tenant', 500);
    await globalPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${row.slug}"`);
    const tenantUrl = `${process.env.DATABASE_URL}?schema=${row.slug}`;
    await execAsync(`npx prisma migrate deploy`, { env: { ...process.env, DATABASE_URL: tenantUrl } });
    await globalPrisma.user.create({
        data: {
            email,
            password: await encrypt(password),
            userType: UserType.TENANT,
            userTenants: {
                create: {
                    tenantId: row.id,
                    roleId: plan.roleId,
                },
            },
        },
    });
    const db = getTenantClient(row.slug);
    await initializeTenantData(db, row);
    return row;
}
export async function updateTenant({ id }, data) {
    const { name, updatedById, businessType, planId, planExpiry, ...rest } = data;
    const slug = toSlug(name);
    if (!slug)
        throw new AppError('Invalid Tenant name provided', 400);
    return globalPrisma.tenant.update({
        where: { id },
        data: {
            name,
            slug,
            businessType: businessType,
            ...rest,
            planId,
            planExpiry: planExpiry ? new Date(planExpiry) : undefined,
            updatedById,
            updatedAt: new Date(),
        },
    });
}
export async function deleteTenant({ id }) {
    const tenant = await globalPrisma.tenant.findUnique({ where: { id } });
    if (!tenant)
        throw new AppError('No Tenant record found with that ID', 404);
    if (tenant.logo) {
        const parts = tenant.logo.split('/');
        const publicId = parts
            .slice(-2)
            .join('/')
            .replace(/\.[^.]+$/, '');
        await deleteImage(publicId).catch(() => { });
    }
    await globalPrisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${tenant.slug}" CASCADE`);
    await globalPrisma.user.deleteMany({ where: { userTenants: { some: { tenantId: id } } } });
    await globalPrisma.userTenant.deleteMany({ where: { tenantId: id } });
    await globalPrisma.tenant.delete({ where: { id } });
    return true;
}
export async function initializeTenantData(db, tenant) {
    const chartOfAccountsExists = (await db.chartOfAccount.findFirst()) !== null;
    if (!chartOfAccountsExists) {
        await db.$transaction(async () => {
            await db.chartOfAccount.create({
                data: {
                    accountNumber: '1000',
                    accountName: 'Assets',
                    accountGroup: AccountGroup.ASSET,
                    accountType: AccountType.GENERAL,
                    accountLevel: 1,
                    children: {
                        create: [
                            {
                                accountNumber: '1100',
                                accountName: 'Current Assets',
                                accountGroup: AccountGroup.ASSET,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '1110',
                                            accountName: 'Cash on Hand',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1120',
                                            accountName: 'Cash in Bank',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1130',
                                            accountName: 'Accounts Receivable',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1140',
                                            accountName: 'Inventory',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1150',
                                            accountName: 'Prepaid Expenses',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '1200',
                                accountName: 'Fixed Assets',
                                accountGroup: AccountGroup.ASSET,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '1210',
                                            accountName: 'Furniture & Fixtures',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1220',
                                            accountName: 'POS Equipment',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '1230',
                                            accountName: 'Leasehold Improvements',
                                            accountGroup: AccountGroup.ASSET,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });
            await db.chartOfAccount.create({
                data: {
                    accountNumber: '2000',
                    accountName: 'Liabilities',
                    accountGroup: AccountGroup.LIABILITY,
                    accountType: AccountType.GENERAL,
                    accountLevel: 1,
                    children: {
                        create: [
                            {
                                accountNumber: '2100',
                                accountName: 'Current Liabilities',
                                accountGroup: AccountGroup.LIABILITY,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '2110',
                                            accountName: 'Accounts Payable',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '2120',
                                            accountName: 'Accrued Expenses',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '2130',
                                            accountName: 'Tax Payable',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '2140',
                                            accountName: 'Customer Deposits / Gift Cards Liability',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '2200',
                                accountName: 'Shariah-Compliant Financing',
                                accountGroup: AccountGroup.LIABILITY,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '2210',
                                            accountName: 'Murabaha Payable',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '2220',
                                            accountName: 'Ijara Payable',
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '2230',
                                            accountName: "Musharakah Partner's Share",
                                            accountGroup: AccountGroup.LIABILITY,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });
            await db.chartOfAccount.create({
                data: {
                    accountNumber: '3000',
                    accountName: 'Equity',
                    accountGroup: AccountGroup.EQUITY,
                    accountType: AccountType.GENERAL,
                    accountLevel: 1,
                    children: {
                        create: [
                            {
                                accountNumber: '3100',
                                accountName: "Owner's Capital",
                                accountGroup: AccountGroup.EQUITY,
                                accountType: AccountType.DETAIL,
                                accountLevel: 2,
                                openingBalance: 0,
                            },
                            {
                                accountNumber: '3200',
                                accountName: 'Retained Earnings',
                                accountGroup: AccountGroup.EQUITY,
                                accountType: AccountType.DETAIL,
                                accountLevel: 2,
                                openingBalance: 0,
                            },
                            {
                                accountNumber: '3300',
                                accountName: 'Drawings / Distributions',
                                accountGroup: AccountGroup.EQUITY,
                                accountType: AccountType.DETAIL,
                                accountLevel: 2,
                                openingBalance: 0,
                            },
                            {
                                accountNumber: '3400',
                                accountName: 'Profit Equalization Reserve',
                                accountGroup: AccountGroup.EQUITY,
                                accountType: AccountType.DETAIL,
                                accountLevel: 2,
                                openingBalance: 0,
                            },
                        ],
                    },
                },
            });
            await db.chartOfAccount.create({
                data: {
                    accountNumber: '4000',
                    accountName: 'Revenue',
                    accountGroup: AccountGroup.REVENUE,
                    accountType: AccountType.GENERAL,
                    accountLevel: 1,
                    children: {
                        create: [
                            {
                                accountNumber: '4100',
                                accountName: 'Sales Revenue',
                                accountGroup: AccountGroup.REVENUE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '4110',
                                            accountName: 'Sales Revenue',
                                            accountGroup: AccountGroup.REVENUE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '4200',
                                accountName: 'Other Income',
                                accountGroup: AccountGroup.REVENUE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '4210',
                                            accountName: 'Service Fees',
                                            accountGroup: AccountGroup.REVENUE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '4220',
                                            accountName: 'Profit from Musharakah/Mudarabah Investments',
                                            accountGroup: AccountGroup.REVENUE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });
            await db.chartOfAccount.create({
                data: {
                    accountNumber: '5000',
                    accountName: 'Expenses',
                    accountGroup: AccountGroup.EXPENSE,
                    accountType: AccountType.GENERAL,
                    accountLevel: 1,
                    children: {
                        create: [
                            {
                                accountNumber: '5100',
                                accountName: 'Cost of Goods Sold',
                                accountGroup: AccountGroup.EXPENSE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '5110',
                                            accountName: 'Cost of Goods Sold',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5120',
                                            accountName: 'Additional Cost',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5130',
                                            accountName: 'Purchase Returns & Allowances',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '5200',
                                accountName: 'Operating Expenses',
                                accountGroup: AccountGroup.EXPENSE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '5210',
                                            accountName: 'Rent Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5220',
                                            accountName: 'Utilities Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5230',
                                            accountName: 'Salaries & Wages',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5240',
                                            accountName: 'Employee Benefits',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5250',
                                            accountName: 'Marketing & Advertising',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5260',
                                            accountName: 'Supplies Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5270',
                                            accountName: 'Repairs & Maintenance',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5280',
                                            accountName: 'Depreciation Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '5300',
                                accountName: 'Administrative Expenses',
                                accountGroup: AccountGroup.EXPENSE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '5310',
                                            accountName: 'Professional Fees',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5320',
                                            accountName: 'Insurance Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5330',
                                            accountName: 'Office Supplies',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                            {
                                accountNumber: '5400',
                                accountName: 'Shariah-Compliant Financial & Ethical Expenses',
                                accountGroup: AccountGroup.EXPENSE,
                                accountType: AccountType.GENERAL,
                                accountLevel: 2,
                                children: {
                                    create: [
                                        {
                                            accountNumber: '5410',
                                            accountName: 'Bank Service Charges',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5420',
                                            accountName: 'Zakat Expense',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5430',
                                            accountName: 'Charity/Donations (Sadaqah)',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                        {
                                            accountNumber: '5440',
                                            accountName: 'Financing Costs',
                                            accountGroup: AccountGroup.EXPENSE,
                                            accountType: AccountType.DETAIL,
                                            accountLevel: 3,
                                            openingBalance: 0,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            });
        });
    }
    const defaultAccountsExists = (await db.defaultAccount.findFirst()) !== null;
    if (!defaultAccountsExists) {
        const accountData = [
            {
                group: AccountGroup.ASSET,
                name: 'Cash',
                accountNumber: '1110',
                description: 'Cash on hand available for daily transactions',
            },
            {
                group: AccountGroup.ASSET,
                name: 'Receivable',
                accountNumber: '1130',
                description: 'Accounts receivable from customers',
            },
            {
                group: AccountGroup.ASSET,
                name: 'Inventory',
                accountNumber: '1140',
                description: 'Inventory of merchandise stock for resale',
            },
            {
                group: AccountGroup.LIABILITY,
                name: 'Payable',
                accountNumber: '2110',
                description: 'Accounts payable to suppliers and vendors',
            },
            {
                group: AccountGroup.LIABILITY,
                name: 'Tax',
                accountNumber: '2130',
                description: 'Sales tax payable collected on transactions',
            },
            {
                group: AccountGroup.EQUITY,
                name: 'Capital',
                accountNumber: '3100',
                description: "Owner's capital and equity investment",
            },
            {
                group: AccountGroup.REVENUE,
                name: 'Revenue',
                accountNumber: '4110',
                description: 'Revenue from sales transactions',
            },
            {
                group: AccountGroup.EXPENSE,
                name: 'Cost of Goods Sold',
                accountNumber: '5110',
                description: 'Cost of goods sold for inventory purchases',
            },
            {
                group: AccountGroup.EXPENSE,
                name: 'Additional Cost',
                accountNumber: '5120',
                description: 'Additional costs for inventory purchases',
            },
        ];
        await Promise.all(accountData.map((item) => db.defaultAccount.create({
            data: {
                group: item.group,
                name: item.name,
                description: item.description,
                account: { connect: { accountNumber: item.accountNumber } },
            },
        })));
    }
    const customersExists = (await db.customer.findFirst()) !== null;
    if (!customersExists) {
        await db.customer.create({ data: { name: 'Walk-in Customer', isDefault: true } });
    }
    const vendorsExists = (await db.vendor.findFirst()) !== null;
    if (!vendorsExists) {
        await db.vendor.create({ data: { name: 'Direct Purchase', isDefault: true } });
    }
}
