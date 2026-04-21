import { toSentenceCase } from "../../utils/formatters.js";
import { Action } from "../../generated/prisma/client.js";
import { globalPrisma } from "../../lib/prisma.js";
export async function createMenu(data) {
  return await globalPrisma.menu.create({ data });
}
export async function getMenus(query) {
  const { portal, parentId } = query;
  return await globalPrisma.menu.findMany({
    where: { portal, parentId: parentId || null },
    include: { children: true },
    orderBy: { sortOrder: "asc" },
  });
}
export async function getMenuById({ id }) {
  return await globalPrisma.menu.findUnique({
    where: { id },
    include: { children: true },
  });
}
export async function updateMenu({ id }, data) {
  return await globalPrisma.menu.update({ where: { id }, data });
}
export async function deleteMenu({ id }) {
  return await globalPrisma.menu.delete({ where: { id } });
}
export async function getNavigationMenus({ roleId }) {
  const rolePermissions = await globalPrisma.rolePermission.findMany({
    where: { roleId, permissions: { has: Action.VIEW } },
    select: { menuId: true, permissions: true },
  });
  const permissionsMap = new Map(
    rolePermissions.map((rp) => [rp.menuId, rp.permissions]),
  );
  const menus = await globalPrisma.menu.findMany({
    where: { parentId: null, isActive: true },
    select: {
      id: true,
      name: true,
      url: true,
      icon: true,
      portal: true,
      sortOrder: true,
      children: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          url: true,
          icon: true,
          portal: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
  const filteredMenus = menus
    .map((menu) => {
      const menuPermission = permissionsMap.get(menu.id);
      const filteredChildren = menu.children
        .filter((child) => permissionsMap.has(child.id))
        .map((child) => {
          const childPermissions = permissionsMap.get(child.id) ?? [];
          return {
            id: child.id,
            name: child.name,
            url: child.url,
            icon: child.icon,
            portal: toSentenceCase(child.portal),
            sortOrder: child.sortOrder,
            permissions: childPermissions.map((p) => ({
              value: p,
              label: toSentenceCase(p),
            })),
          };
        });
      if (menuPermission || filteredChildren.length > 0) {
        return {
          id: menu.id,
          name: menu.name,
          url: menu.url,
          icon: menu.icon,
          portal: toSentenceCase(menu.portal),
          sortOrder: menu.sortOrder,
          permissions: (menuPermission ?? []).map((p) => ({
            value: p,
            label: toSentenceCase(p),
          })),
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter((menu) => menu !== null);
  return filteredMenus;
}
