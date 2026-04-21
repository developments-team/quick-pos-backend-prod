import { Type } from '../../utils/schema.js';
export const taxBodySchema = Type.Object({
    name: Type.String(),
    percentage: Type.Optional(Type.Number()),
    isDefault: Type.Optional(Type.Boolean()),
});
export const taxParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
