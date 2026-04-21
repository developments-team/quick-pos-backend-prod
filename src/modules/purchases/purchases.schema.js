import { Type } from '../../utils/schema.js';
export const additionalCostSchema = Type.Object({
    id: Type.Optional(Type.String()),
    costTypeId: Type.String(),
    vendorId: Type.Optional(Type.String()),
    amount: Type.Number(),
    accountId: Type.Optional(Type.String()),
});
export const purchaseDetailSchema = Type.Object({
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
export const purchaseBodySchema = Type.Object({
    branchId: Type.String(),
    vendorId: Type.Optional(Type.String()),
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
    additionalCostsAmount: Type.Optional(Type.Number()),
    discountItemsType: Type.Optional(Type.String()),
    purchaseDetails: Type.Optional(Type.Array(purchaseDetailSchema)),
    additionalCosts: Type.Optional(Type.Array(additionalCostSchema)),
});
export const purchaseParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
