import { Action } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
export async function getRolePermission(prisma, { roleId }) {
    const allMenus = await prisma.menu.findMany({ orderBy: [{ sortOrder: 'asc' }] });
    const existingPermissions = await prisma.rolePermission.findMany({ where: { roleId: String(roleId) } });
    const permissionMap = new Map(existingPermissions.map((p) => [p.menuId, p]));
    const buildMenuPermissions = (menu) => {
        const existingPerm = permissionMap.get(menu.id);
        const availableActions = [Action.VIEW, ...(menu.actions ?? [])];
        const permissions = existingPerm?.permissions ?? [];
        const result = { id: menu.id, name: menu.name, availableActions, permissions };
        if (menu.icon)
            result.icon = menu.icon;
        if (menu.url)
            result.url = menu.url;
        return result;
    };
    const parentMenus = allMenus.filter((m) => !m.parentId);
    const childMenus = allMenus.filter((m) => m.parentId);
    return parentMenus.map((parent) => {
        const children = childMenus.filter((child) => child.parentId === parent.id).map(buildMenuPermissions);
        return { ...buildMenuPermissions(parent), children: children.length > 0 ? children : null };
    });
}
export async function upsertPermission(prisma, { roleId }, data, userId) {
    if (!roleId || !Array.isArray(data.permissions) || data.permissions.length === 0) {
        throw new AppError('Incomplete data', 400);
    }
    const ops = data.permissions.map((perm) => {
        const { menuId, permissions } = perm;
        return prisma.rolePermission.upsert({
            where: { roleId_menuId: { roleId, menuId } },
            update: {
                permissions,
            },
            create: {
                roleId,
                menuId,
                permissions,
            },
        });
    });
    return await prisma.$transaction(ops);
}
export async function getAllRolePermissions(prisma) {
    return await prisma.rolePermission.findMany();
}
export async function deleteAllRolePermissions(prisma) {
    return await prisma.rolePermission.deleteMany();
}
