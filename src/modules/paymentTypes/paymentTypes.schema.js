import { Type } from '../../utils/schema.js';
export const paymentTypeBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    isDefault: Type.Optional(Type.Boolean()),
});
export const paymentTypeParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
