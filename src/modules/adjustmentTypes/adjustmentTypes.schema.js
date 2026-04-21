import { Type } from '../../utils/schema.js';
export const adjustmentTypeBodySchema = Type.Object({
    name: Type.String(),
    isDefault: Type.Optional(Type.Boolean()),
});
export const adjustmentTypeParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
