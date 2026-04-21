import { Type } from '../../utils/schema.js';
export const customerGroupBodySchema = Type.Object({
    name: Type.String(),
    discountPercentage: Type.Optional(Type.Number()),
    isDefault: Type.Optional(Type.Boolean()),
});
export const customerGroupParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
