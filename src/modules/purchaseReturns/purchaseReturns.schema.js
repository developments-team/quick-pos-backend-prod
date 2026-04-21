import { Type } from '../../utils/schema.js';
export const purchaseReturnDetailSchema = Type.Object({
    id: Type.Optional(Type.String()),
    productId: Type.String(),
    productDetailId: Type.String(),
    purchasePrice: Type.Optional(Type.Number()),
    salePrice: Type.Optional(Type.Number()),
    quantity: Type.Optional(Type.Number()),
    total: Type.Optional(Type.Number()),
    reason: Type.Optional(Type.String()),
});
export const purchaseReturnBodySchema = Type.Object({
    branchId: Type.String(),
    purchaseId: Type.String(),
    vendorId: Type.Optional(Type.String()),
    totalAmount: Type.Optional(Type.Number()),
    paymentType: Type.Optional(Type.String()),
    purchaseReturnDetails: Type.Optional(Type.Array(purchaseReturnDetailSchema)),
});
export const purchaseReturnQuerySchema = Type.Object({
    page: Type.Optional(Type.String()),
    limit: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    vendorId: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String()),
    endDate: Type.Optional(Type.String()),
});
export const purchaseReturnParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
