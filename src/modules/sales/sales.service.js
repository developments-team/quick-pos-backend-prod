import { TransactionStatus } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import incrementLastRef from '../../utils/genRef.js';
import { normalizeField as nf } from '../../utils/dataHelpers.js';
import { saveNotification } from '../../utils/saveNotification.js';
export async function getSales(prisma) {
    const sales = await prisma.sale.findMany({
        include: {
            branch: { select: { name: true } },
            customer: { select: { name: true } },
            saleDetails: {
                include: {
                    product: { select: { name: true } },
                    productDetail: { select: { sku: true } },
                },
            },
        },
    });
    const creatorIds = [...new Set(sales.map((s) => s.createdById).filter(Boolean))];
    const creators = creatorIds.length
        ? await prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, email: true } })
        : [];
    const creatorMap = new Map(creators.map((u) => [u.id, { email: u.email }]));
    return sales.map((s) => ({
        ...s,
        createdBy: s.createdById ? (creatorMap.get(s.createdById) ?? null) : null,
    }));
}
export async function getSaleById(prisma, { id }) {
    const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
            branch: { select: { name: true } },
            customer: { select: { name: true } },
            saleDetails: {
                include: {
                    product: { select: { name: true } },
                    productDetail: { select: { sku: true } },
                },
            },
        },
    });
    if (!sale)
        throw new AppError('No Sale found with that ID', 404);
    const createdBy = sale.createdById
        ? await prisma.user.findUnique({ where: { id: sale.createdById }, select: { email: true } })
        : null;
    return { ...sale, createdBy };
}
export async function createSale(prisma, globalPrisma, data) {
    const result = await prisma.$transaction(async (tx) => {
        const defaultAccounts = new Map((await tx.defaultAccount.findMany()).map((acc) => [acc.name, acc]));
        let customer = data.customerId ? await tx.customer.findUnique({ where: { id: nf(data.customerId) } }) : null;
        if (!customer)
            customer = await tx.customer.findFirst({ where: { isDefault: true } });
        if (!customer)
            throw new AppError('No customer found and no default customer set', 400);
        const lastTran = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'SAL' } },
            orderBy: { ref: 'desc' },
        });
        const ref = incrementLastRef('SAL', lastTran?.ref ?? null);
        const sale = await tx.sale.create({
            data: {
                ref,
                customerId: customer.id,
                branchId: nf(data.branchId),
                subTotal: data.subTotal,
                taxPercentage: data.taxPercentage,
                taxAmount: data.taxAmount,
                discountType: data.discountType,
                discountPercentage: data.discountPercentage,
                discountAmount: data.discountAmount,
                totalDiscountAmount: data.totalDiscountAmount,
                total: data.total,
                paid: data.paid,
                due: data.due,
                createdById: data.createdById,
            },
        });
        if (data.saleDetails?.length) {
            await tx.saleDetail.createMany({
                data: data.saleDetails.map((d) => ({
                    saleId: sale.id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    quantity: d.quantity,
                    price: d.price,
                    discountType: d.discountType,
                    discountPercentage: d.discountPercentage,
                    discountAmount: d.discountAmount,
                    total: d.total,
                })),
            });
            for (const d of data.saleDetails) {
                const stock = await tx.stockInventory.findUnique({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: sale.branchId,
                        },
                    },
                });
                if (!stock || stock.quantity < d.quantity) {
                    throw new AppError(`Insufficient stock for product ${d.productId}`, 400);
                }
                await tx.stockInventory.update({
                    where: { id: stock.id },
                    data: {
                        quantity: { decrement: d.quantity },
                        soldQuantity: { increment: d.quantity },
                    },
                });
            }
        }
        const entries = [];
        if (data.paid > 0) {
            entries.push({
                accountId: defaultAccounts.get('Cash')?.accountId,
                debit: data.paid,
                credit: 0,
                memo: 'Sale Received',
            });
        }
        if (data.due > 0) {
            entries.push({
                accountId: defaultAccounts.get('Receivable')?.accountId,
                debit: data.due,
                credit: 0,
                memo: 'Accounts Receivable',
            });
        }
        entries.push({
            accountId: defaultAccounts.get('Revenue')?.accountId,
            debit: 0,
            credit: data.subTotal,
            memo: 'Sales Revenue',
        });
        if (data.taxAmount > 0) {
            entries.push({
                accountId: defaultAccounts.get('Payable')?.accountId,
                debit: 0,
                credit: data.taxAmount,
                memo: 'Sales Tax Payable',
            });
        }
        if (data.saleDetails?.length) {
            for (const d of data.saleDetails) {
                const stock = await tx.stockInventory.findUnique({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: sale.branchId,
                        },
                    },
                });
                if (stock) {
                    const costAmount = (stock.cost || 0) * (d.quantity || 0);
                    entries.push({
                        accountId: defaultAccounts.get('Cost of Goods Sold')?.accountId,
                        debit: costAmount,
                        credit: 0,
                        memo: 'COGS',
                        productDetailId: d.productDetailId,
                    }, {
                        accountId: defaultAccounts.get('Inventory')?.accountId,
                        debit: 0,
                        credit: costAmount,
                        memo: 'Inventory Asset Reduction',
                        productDetailId: d.productDetailId,
                    });
                }
            }
        }
        await tx.transaction.createMany({
            data: entries.map((entry) => ({
                ref,
                tranType: 'Sales',
                particularId: customer.id,
                ...entry,
                status: TransactionStatus.POSTED,
                description: `Sale transaction for customer ${customer.name}`,
                createdById: data.createdById,
            })),
        });
        await saveNotification({
            prisma: globalPrisma,
            ref: sale.ref,
            type: 'sale',
            title: 'New Sale Created',
            message: `Sale ${sale.ref} created successfully`,
            user: data.createdById,
            itemID: sale.id,
        });
        return sale;
    });
    return result;
}
export async function updateSale(prisma, { id }, data) {
    const result = await prisma.$transaction(async (tx) => {
        const existingSale = await tx.sale.findUnique({ where: { id }, include: { saleDetails: true } });
        if (!existingSale)
            throw new AppError('Sale not found', 404);
        const defaultAccounts = new Map((await tx.defaultAccount.findMany()).map((acc) => [acc.name, acc]));
        let customer = data.customerId ? await tx.customer.findUnique({ where: { id: nf(data.customerId) } }) : null;
        if (!customer)
            customer = await tx.customer.findFirst({ where: { isDefault: true } });
        if (!customer)
            throw new AppError('No customer found', 400);
        const sale = await tx.sale.update({
            where: { id },
            data: {
                customerId: customer.id,
                branchId: nf(data.branchId),
                subTotal: data.subTotal,
                taxPercentage: data.taxPercentage,
                taxAmount: data.taxAmount,
                discountType: data.discountType,
                discountPercentage: data.discountPercentage,
                discountAmount: data.discountAmount,
                totalDiscountAmount: data.totalDiscountAmount,
                total: data.total,
                paid: data.paid,
                due: data.due,
                updatedById: data.updatedById,
            },
        });
        const existingDetailIds = new Set(existingSale.saleDetails.map((d) => d.id));
        const newDetails = data.saleDetails || [];
        const newDetailIds = new Set(newDetails.filter((d) => d.id).map((d) => d.id));
        const toDelete = existingSale.saleDetails.filter((d) => !newDetailIds.has(d.id));
        if (toDelete.length) {
            await tx.saleDetail.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
            for (const d of toDelete) {
                await tx.stockInventory.updateMany({
                    where: { productDetailId: d.productDetailId, branchId: existingSale.branchId },
                    data: { quantity: { increment: d.quantity }, soldQuantity: { decrement: d.quantity } },
                });
            }
        }
        const toCreate = newDetails.filter((d) => !d.id);
        if (toCreate.length) {
            await tx.saleDetail.createMany({
                data: toCreate.map((d) => ({
                    saleId: sale.id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    quantity: d.quantity,
                    price: d.price,
                    discountType: d.discountType,
                    discountPercentage: d.discountPercentage,
                    discountAmount: d.discountAmount,
                    total: d.total,
                })),
            });
            for (const d of toCreate) {
                const stock = await tx.stockInventory.findUnique({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: sale.branchId,
                        },
                    },
                });
                if (!stock || stock.quantity < d.quantity) {
                    throw new AppError(`Insufficient stock for product ${d.productId}`, 400);
                }
                await tx.stockInventory.update({
                    where: { id: stock.id },
                    data: { quantity: { decrement: d.quantity }, soldQuantity: { increment: d.quantity } },
                });
            }
        }
        const toUpdate = newDetails.filter((d) => d.id && existingDetailIds.has(d.id));
        for (const d of toUpdate) {
            const oldDetail = existingSale.saleDetails.find((od) => od.id === d.id);
            if (!oldDetail)
                continue;
            if (oldDetail.quantity !== d.quantity || oldDetail.price !== d.price || oldDetail.total !== d.total) {
                await tx.saleDetail.update({
                    where: { id: d.id },
                    data: {
                        quantity: d.quantity,
                        price: d.price,
                        discountType: d.discountType,
                        discountPercentage: d.discountPercentage,
                        discountAmount: d.discountAmount,
                        total: d.total,
                    },
                });
                const qtyDiff = d.quantity - oldDetail.quantity;
                if (qtyDiff !== 0) {
                    const stock = await tx.stockInventory.findUnique({
                        where: {
                            productId_productDetailId_branchId: {
                                productId: d.productId,
                                productDetailId: d.productDetailId,
                                branchId: sale.branchId,
                            },
                        },
                    });
                    if (qtyDiff > 0 && (!stock || stock.quantity < qtyDiff)) {
                        throw new AppError(`Insufficient stock to add ${qtyDiff} more units of ${d.productId}`, 400);
                    }
                    await tx.stockInventory.updateMany({
                        where: { productDetailId: d.productDetailId, branchId: sale.branchId },
                        data: { quantity: { decrement: qtyDiff }, soldQuantity: { increment: qtyDiff } },
                    });
                }
            }
        }
        await tx.transaction.deleteMany({ where: { ref: sale.ref } });
        const entries = [];
        if (data.paid > 0)
            entries.push({
                accountId: defaultAccounts.get('Cash')?.accountId,
                debit: data.paid,
                credit: 0,
                memo: 'Sale Received',
            });
        if (data.due > 0)
            entries.push({
                accountId: defaultAccounts.get('Receivable')?.accountId,
                debit: data.due,
                credit: 0,
                memo: 'Accounts Receivable',
            });
        entries.push({
            accountId: defaultAccounts.get('Revenue')?.accountId,
            debit: 0,
            credit: data.subTotal,
            memo: 'Sales Revenue',
        });
        if (data.taxAmount > 0)
            entries.push({
                accountId: defaultAccounts.get('Payable')?.accountId,
                debit: 0,
                credit: data.taxAmount,
                memo: 'Sales Tax Payable',
            });
        const finalDetails = await tx.saleDetail.findMany({ where: { saleId: sale.id } });
        for (const d of finalDetails) {
            const stock = await tx.stockInventory.findUnique({
                where: {
                    productId_productDetailId_branchId: {
                        productId: d.productId,
                        productDetailId: d.productDetailId,
                        branchId: sale.branchId,
                    },
                },
            });
            if (stock) {
                const costAmount = (stock.cost || 0) * (d.quantity || 0);
                entries.push({
                    accountId: defaultAccounts.get('Cost of Goods Sold')?.accountId,
                    debit: costAmount,
                    credit: 0,
                    memo: 'COGS',
                    productDetailId: d.productDetailId,
                }, {
                    accountId: defaultAccounts.get('Inventory')?.accountId,
                    debit: 0,
                    credit: costAmount,
                    memo: 'Inventory Asset Reduction',
                    productDetailId: d.productDetailId,
                });
            }
        }
        await tx.transaction.createMany({
            data: entries.map((entry) => ({
                ref: sale.ref,
                tranType: 'Sales',
                particularId: customer.id,
                ...entry,
                status: TransactionStatus.POSTED,
                description: `Updated Sale transaction for customer ${customer.name}`,
                createdById: data.updatedById,
            })),
        });
        return sale;
    });
    return result;
}
export async function deleteSale(prisma, { id }) {
    await prisma.saleDetail.deleteMany({ where: { saleId: id } });
    return await prisma.sale.delete({ where: { id } });
}
