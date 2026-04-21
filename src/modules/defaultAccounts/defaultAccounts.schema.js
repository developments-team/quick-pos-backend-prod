import { Type } from '../../utils/schema.js';
export const defaultAccountItemSchema = Type.Object({
    id: Type.Optional(Type.String()),
    name: Type.Optional(Type.String()),
    group: Type.Optional(Type.String()),
    accountId: Type.String(),
});
export const defaultAccountBodySchema = Type.Object({
    data: Type.Array(defaultAccountItemSchema),
});
export const defaultAccountParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
