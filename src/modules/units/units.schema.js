import { Type } from '../../utils/schema.js';
export const unitBodySchema = Type.Object({
    name: Type.String(),
    shortName: Type.String(),
    description: Type.Optional(Type.String()),
});
export const unitParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
