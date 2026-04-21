import { Type } from '../../utils/schema.js';
export const customerBodySchema = Type.Object({
    name: Type.String(),
    phone: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    tin: Type.Optional(Type.String()),
    company: Type.Optional(Type.String()),
    customerGroupId: Type.Optional(Type.String()),
    receivableAccountId: Type.Optional(Type.String()),
});
export const customerParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
