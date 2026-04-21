import { Type } from '../../utils/schema.js';
export const userBodySchema = Type.Object({
    email: Type.String(),
    roleId: Type.String({ format: 'uuid' }),
    userBranches: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});
export const userParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
