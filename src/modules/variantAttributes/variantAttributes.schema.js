import { Type } from '../../utils/schema.js';
export const variantAttributeBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
});
export const variantAttributeParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
