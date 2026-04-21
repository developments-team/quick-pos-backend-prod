import { Type } from '../../utils/schema.js';
export const receiptBodySchema = Type.Object({
    customerId: Type.String({ format: 'uuid' }),
    amount: Type.Number(),
    paymentTypeId: Type.String(),
    description: Type.Optional(Type.String()),
});
export const receiptParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
