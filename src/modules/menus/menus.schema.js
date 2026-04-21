import { Action, Portal } from '../../generated/prisma/client.js';
import { Type } from '../../utils/schema.js';
export const MenuAction = Type.Union(Object.values(Action)
    .filter((value) => value !== Action.VIEW)
    .map((value) => Type.Literal(value)));
export const menuBodySchema = Type.Object({
    name: Type.String(),
    parentId: Type.Optional(Type.String({ format: 'uuid' })),
    url: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    sortOrder: Type.Optional(Type.Number()),
    isActive: Type.Optional(Type.Boolean()),
    actions: Type.Optional(Type.Array(MenuAction)),
});
export const menuParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
export const navigationMenusParamsSchema = Type.Object({
    roleId: Type.String({
        minLength: 1,
        errorMessage: {
            type: 'roleId must be a string',
            minLength: 'roleId is required',
        },
    }),
});
export const menusQuerySchema = Type.Object({
    portal: Type.Unsafe({
        enum: Object.values(Portal),
    }),
    parentId: Type.Optional(Type.String()),
});
