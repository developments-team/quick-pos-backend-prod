import { Type } from '../../utils/schema.js';
export const branchBodySchema = Type.Object({
    name: Type.String(),
    description: Type.String(),
    address: Type.String(),
});
export const branchParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
