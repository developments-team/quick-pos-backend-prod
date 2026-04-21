import { Type } from '../../utils/schema.js';
export const costTypeBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    isDefault: Type.Optional(Type.Boolean()),
});
export const costTypeParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
