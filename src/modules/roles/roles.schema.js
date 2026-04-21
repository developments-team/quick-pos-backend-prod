import { Type } from '../../utils/schema.js';
import { Action, Portal } from '../../generated/prisma/client.js';
export const PermissionAction = Type.Union(Object.values(Action).map((value) => Type.Literal(value)));
export const roleBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    portal: Type.Union(Object.values(Portal).map((value) => Type.Literal(value))),
    tenantId: Type.Optional(Type.String({ format: 'uuid' })),
    rolePermissions: Type.Array(Type.Object({
        menuId: Type.String({ format: 'uuid' }),
        permissions: Type.Array(PermissionAction),
    })),
});
export const roleParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
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
export const menuRolePermissionsParamsSchema = Type.Object({
    portal: Type.Unsafe({
        enum: Object.values(Portal),
    }),
    roleId: Type.Optional(Type.String({ format: 'uuid' })),
});
export const tenantQuerySchema = Type.Object({
    tenantId: Type.Optional(Type.String({ format: 'uuid' })),
    portal: Type.Optional(Type.Unsafe({
        enum: Object.values(Portal),
    })),
});
