import { Type } from '../../utils/schema.js';
export const salesReportQuerySchema = Type.Object({
    fromDate: Type.String(),
    toDate: Type.String(),
    categoryId: Type.Optional(Type.String()),
    brandId: Type.Optional(Type.String()),
    groupId: Type.Optional(Type.String()),
    customerId: Type.Optional(Type.String()),
    paymentTypeId: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    groupBy: Type.Optional(Type.String()),
});
