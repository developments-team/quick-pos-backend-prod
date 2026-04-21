import { Type } from '../../utils/schema.js';
export const saleReturnDetailSchema = Type.Object({
    productId: Type.String(),
    productDetailId: Type.String(),
    quantity: Type.Number(),
    saleReturnId: Type.Optional(Type.String()),
});
export const saleReturnBodySchema = Type.Object({
    saleId: Type.String(),
    branchId: Type.String(),
    customerId: Type.Optional(Type.String()),
    subTotal: Type.Optional(Type.Number()),
    discount: Type.Optional(Type.Number()),
    tax: Type.Optional(Type.Number()),
    total: Type.Optional(Type.Number()),
    refund: Type.Optional(Type.Number()),
    saleReturnDetails: Type.Array(saleReturnDetailSchema),
});
export const saleReturnParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
