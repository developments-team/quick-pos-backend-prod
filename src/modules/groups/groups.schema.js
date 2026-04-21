import { Type } from '../../utils/schema.js';
export const groupBodySchema = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
});
export const groupParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
