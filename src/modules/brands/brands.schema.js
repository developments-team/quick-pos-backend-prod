import { Type } from '../../utils/schema.js';
export const brandBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
});
export const brandParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
