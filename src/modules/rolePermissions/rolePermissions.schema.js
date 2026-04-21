import { Action } from '../../generated/prisma/client.js';
import { Type } from '../../utils/schema.js';
export const PermissionAction = Type.Union(Object.values(Action).map((value) => Type.Literal(value)));
export const permissionItemSchema = Type.Object({
    menuId: Type.String({ format: 'uuid' }),
    permissions: Type.Array(PermissionAction),
});
export const rolePermissionBodySchema = Type.Object({
    permissions: Type.Array(permissionItemSchema),
});
export const rolePermissionParamsSchema = Type.Object({
    roleId: Type.String({ format: 'uuid' }),
});
export const rolePermissionQuerySchema = Type.Object({
    roleId: Type.String({ format: 'uuid' }),
});
