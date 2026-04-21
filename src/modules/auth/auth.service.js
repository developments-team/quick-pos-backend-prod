import { UserType } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import { globalPrisma, getTenantClient } from '../../lib/prisma.js';
export async function login(data) {
    const { email, password } = data;
    if (!email || !password) {
        throw new AppError('Please provide email and password!', 400);
    }
    const userData = await globalPrisma.user.findUnique({
        where: {
            email: email,
        },
        relationLoadStrategy: 'join',
        select: {
            id: true,
            email: true,
            password: true,
            isActive: true,
            userType: true,
            portal: true,
            role: { select: { id: true, name: true } },
            userTenants: {
                select: {
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            address: true,
                            email: true,
                            phone: true,
                            logo: true,
                            allowTax: true,
                            taxRate: true,
                            decimalPoints: true,
                            salesTemplate: true,
                            plan: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                    role: { select: { id: true, name: true } },
                },
            },
        },
    });
    if (!userData) {
        throw new AppError('Incorrect email or password', 401);
    }
    const profile = await globalPrisma.profile.findUnique({
        where: { userId: userData.id },
        select: { firstName: true, lastName: true },
    });
    const userBranchRows = await globalPrisma.userBranch.findMany({
        where: { userId: userData.id, status: true },
        select: { tenantId: true, branchId: true },
    });
    const branchIdsByTenant = new Map();
    for (const ub of userBranchRows) {
        const arr = branchIdsByTenant.get(ub.tenantId) || [];
        arr.push(ub.branchId);
        branchIdsByTenant.set(ub.tenantId, arr);
    }
    const tenantSlugMap = new Map(userData.userTenants.map((ut) => [ut.tenant.id, ut.tenant.slug]));
    const branchMap = new Map();
    for (const [tenantId, branchIds] of branchIdsByTenant) {
        const slug = tenantSlugMap.get(tenantId);
        if (!slug || !branchIds.length)
            continue;
        const tenantDb = getTenantClient(slug);
        const branches = await tenantDb.branch.findMany({
            where: { id: { in: branchIds } },
            select: { id: true, name: true, address: true, description: true },
        });
        for (const b of branches)
            branchMap.set(b.id, b);
    }
    const userBranches = userBranchRows.map((ub) => ({
        tenantId: ub.tenantId,
        branch: branchMap.get(ub.branchId),
    }));
    const { id, email: _email, password: _password, userTenants, userType, portal, role } = userData;
    const base = {
        id,
        email: _email,
        portal: portal,
        role: role,
    };
    switch (userType) {
        case UserType.ADMIN:
            return { ...base };
        case UserType.TENANT:
            return {
                ...base,
                name: userTenants[0]?.tenant.name,
                tenant: userTenants[0]?.tenant,
                role: userTenants[0]?.role,
                branches: userBranches,
            };
        case UserType.USER:
            return {
                ...base,
                name: profile ? `${profile.firstName} ${profile.lastName}` : '',
                tenants: userTenants.map((ut) => ({
                    ...ut,
                    branches: userBranches.filter((ub) => ub.tenantId === ut.tenant.id).map((ub) => ub.branch),
                })),
                hasProfile: !!profile,
            };
        default:
            return { ...base };
    }
}
