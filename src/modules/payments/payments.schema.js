import { Type } from '../../utils/schema.js';
export const paymentBodySchema = Type.Object({
    vendorId: Type.String({ format: 'uuid' }),
    amount: Type.Number(),
    paymentTypeId: Type.String(),
    description: Type.Optional(Type.String()),
});
export const paymentParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
