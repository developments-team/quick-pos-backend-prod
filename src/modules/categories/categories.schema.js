import { Type } from '../../utils/schema.js';
export const categoryBodySchema = Type.Object({
    name: Type.String(),
    color: Type.Optional(Type.String()),
    icon: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
});
export const categoryParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
