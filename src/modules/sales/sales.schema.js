import { Type } from '../../utils/schema.js';
export const saleDetailSchema = Type.Object({
    id: Type.Optional(Type.String()),
    productId: Type.String(),
    productDetailId: Type.String(),
    quantity: Type.Optional(Type.Number()),
    price: Type.Optional(Type.Number()),
    discountType: Type.Optional(Type.String()),
    discountPercentage: Type.Optional(Type.Number()),
    discountAmount: Type.Optional(Type.Number()),
    total: Type.Optional(Type.Number()),
});
export const saleBodySchema = Type.Object({
    branchId: Type.String(),
    customerId: Type.Optional(Type.String()),
    subTotal: Type.Optional(Type.Number()),
    taxPercentage: Type.Optional(Type.Number()),
    taxAmount: Type.Optional(Type.Number()),
    discountType: Type.Optional(Type.String()),
    discountPercentage: Type.Optional(Type.Number()),
    discountAmount: Type.Optional(Type.Number()),
    totalDiscountAmount: Type.Optional(Type.Number()),
    total: Type.Optional(Type.Number()),
    paid: Type.Optional(Type.Number()),
    due: Type.Optional(Type.Number()),
    paymentTypeId: Type.Optional(Type.String()),
    saleDetails: Type.Optional(Type.Array(saleDetailSchema)),
});
export const saleParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
