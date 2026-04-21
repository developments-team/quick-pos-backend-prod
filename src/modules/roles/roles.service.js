import { Portal } from '../../generated/prisma/client.js';
export async function createRole(prisma, data) {
    const { rolePermissions, ...roleData } = data;
    return await prisma.$transaction(async (tx) => {
        const role = await tx.role.create({
            data: {
                ...roleData,
                rolePermissions: {
                    create: rolePermissions.map((rp) => ({
                        menuId: rp.menuId,
                        permissions: rp.permissions,
                    })),
                },
            },
            include: {
                rolePermissions: true,
            },
        });
        return role;
    });
}
export async function getRoles(prisma, tenantId, portal) {
    return await prisma.role.findMany({
        where: {
            ...(tenantId ? { tenantId } : { tenantId: null }),
            ...(portal && { portal }),
        },
        include: {
            rolePermissions: {
                include: {
                    menu: { select: { id: true, name: true, actions: true, parent: { select: { id: true, name: true } } } },
                },
            },
        },
    });
}
export async function getRoleById(prisma, { id }) {
    return await prisma.role.findUnique({ where: { id }, include: { rolePermissions: true } });
}
export async function updateRole(prisma, { id }, data) {
    const { rolePermissions, ...roleData } = data;
    return await prisma.$transaction(async (tx) => {
        const role = await tx.role.update({
            where: { id },
            data: roleData,
        });
        if (rolePermissions) {
            const incomingMenuIds = rolePermissions.map((rp) => rp.menuId);
            await Promise.all([
                tx.rolePermission.deleteMany({
                    where: { roleId: id, menuId: { notIn: incomingMenuIds } },
                }),
                ...rolePermissions.map((rp) => tx.rolePermission.upsert({
                    where: { roleId_menuId: { roleId: id, menuId: rp.menuId } },
                    update: { permissions: rp.permissions },
                    create: { roleId: id, menuId: rp.menuId, permissions: rp.permissions },
                })),
            ]);
        }
        return await tx.role.findUnique({
            where: { id },
            include: { rolePermissions: true },
        });
    });
}
export async function deleteRole(prisma, { id }) {
    return await prisma.$transaction(async (tx) => {
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        return await tx.role.delete({ where: { id } });
    });
}
export async function getMenuRolePermissions(prisma, portal, roleId) {
    const menus = await prisma.menu.findMany({
        where: { portal, parentId: null },
        select: {
            id: true,
            name: true,
            actions: true,
            children: {
                select: { id: true, name: true, actions: true },
                orderBy: { sortOrder: 'asc' },
            },
        },
        orderBy: { sortOrder: 'asc' },
    });
    if (!roleId) {
        return menus;
    }
    const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId },
        select: { menuId: true, permissions: true },
    });
    const permissionsMap = new Map(rolePermissions.map((rp) => [rp.menuId, rp.permissions]));
    return menus.map((menu) => ({
        ...menu,
        permissions: permissionsMap.get(menu.id) ?? [],
        children: menu.children.map((child) => ({
            ...child,
            permissions: permissionsMap.get(child.id) ?? [],
        })),
    }));
}
export async function getRolesPlan(prisma) {
    return await prisma.role.findMany({
        where: { portal: Portal.TENANT, tenantId: null },
        select: { id: true, name: true },
    });
}
