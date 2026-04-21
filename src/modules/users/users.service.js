import { hashPassword } from '../../utils/hash.js';
import genPwd from '../../utils/genPwd.js';
import { sendInvitePasswordEmail } from '../../config/mailer.js';
import AppError from '../../utils/appError.js';
export async function createUser(prisma, data) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        if (existingUser.userType !== 'USER') {
            throw new AppError('A non-user account with this email already exists', 409);
        }
        const existingTenant = await prisma.userTenant.findFirst({
            where: { userId: existingUser.id, tenantId: data.tenantId },
        });
        if (existingTenant) {
            throw new AppError('User is already assigned to this tenant', 409);
        }
        if (data.roleId) {
            await prisma.userTenant.create({
                data: { userId: existingUser.id, tenantId: data.tenantId, roleId: data.roleId },
            });
        }
        if (data.userBranches && data.userBranches.length) {
            await prisma.userBranch.createMany({
                data: data.userBranches.map((branchId) => ({
                    userId: existingUser.id,
                    branchId,
                    tenantId: data.tenantId,
                })),
            });
        }
        return existingUser;
    }
    const password = genPwd();
    const row = await prisma.user.create({
        data: {
            email: data.email,
            password: hashPassword(password),
            createdById: data.createdById,
            userTenants: data.roleId && data.roleId
                ? {
                    create: {
                        tenantId: data.tenantId,
                        roleId: data.roleId,
                    },
                }
                : undefined,
        },
    });
    if (data.userBranches && data.userBranches.length) {
        await prisma.userBranch.createMany({
            data: data.userBranches.map((branchId) => ({
                userId: row.id,
                branchId,
                tenantId: data.tenantId,
            })),
        });
    }
    await sendInvitePasswordEmail(data.email, password);
    return row;
}
export async function getUsers(prisma, tenantId, tenantPrisma) {
    const users = await prisma.user.findMany({
        where: tenantId ? { userTenants: { some: { tenantId } } } : { userTenants: { none: {} } },
        select: {
            id: true,
            email: true,
            userTenants: {
                select: {
                    tenant: { select: { id: true, name: true, slug: true } },
                    role: { select: { id: true, name: true } },
                },
            },
        },
    });
    const userIds = users.map((u) => u.id);
    const profiles = userIds.length
        ? await prisma.profile.findMany({
            where: { userId: { in: userIds } },
            select: { userId: true, firstName: true, lastName: true, phone: true, email: true },
        })
        : [];
    const profileMap = new Map(profiles.map((p) => [p.userId, { firstName: p.firstName, lastName: p.lastName, phone: p.phone, email: p.email }]));
    const userBranches = userIds.length
        ? await prisma.userBranch.findMany({
            where: { userId: { in: userIds } },
            select: { userId: true, branchId: true },
        })
        : [];
    const branchIds = [...new Set(userBranches.map((ub) => ub.branchId))];
    const branchClient = tenantPrisma || prisma;
    const branches = branchIds.length
        ? await branchClient.branch.findMany({
            where: { id: { in: branchIds } },
            select: { id: true, name: true },
        })
        : [];
    const branchMap = new Map(branches.map((b) => [b.id, b]));
    return users.map((u) => ({
        ...u,
        profile: profileMap.get(u.id) ?? null,
        userBranches: userBranches
            .filter((ub) => ub.userId === u.id)
            .map((ub) => ({ branch: branchMap.get(ub.branchId) })),
    }));
}
export async function getUserById(prisma, { id }) {
    return await prisma.user.findUnique({ where: { id } });
}
export async function updateUser(prisma, { id }, data) {
    const { userBranches, tenantId, ...updateData } = data;
    const user = await prisma.user.update({
        where: { id },
        data: { email: updateData.email, updatedById: updateData.updatedById, updatedAt: updateData.updatedAt },
    });
    console.log(userBranches);
    if (userBranches) {
        await prisma.userBranch.deleteMany({
            where: { userId: id, tenantId },
        });
        if (userBranches.length) {
            await prisma.userBranch.createMany({
                data: userBranches.map((branchId) => ({
                    userId: id,
                    branchId,
                    tenantId,
                })),
            });
        }
    }
    return user;
}
export async function deleteUser(prisma, { id }) {
    return await prisma.user.delete({ where: { id } });
}
