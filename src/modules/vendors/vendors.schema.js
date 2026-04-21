import { Type } from '../../utils/schema.js';
export const vendorBodySchema = Type.Object({
    name: Type.String(),
    phone: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    address: Type.Optional(Type.String()),
    tin: Type.Optional(Type.String()),
    company: Type.Optional(Type.String()),
    vendorType: Type.Optional(Type.String()),
    payableAccountId: Type.Optional(Type.String()),
});
export const vendorParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
export const vendorStatementQuerySchema = Type.Object({
    fromDate: Type.String(),
    toDate: Type.String(),
});
export const vendorTypeQuerySchema = Type.Object({
    type: Type.String(),
});
