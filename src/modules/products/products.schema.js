import { Type } from '../../utils/schema.js';
const productVariantSchema = Type.Object({
    variantId: Type.String({ format: 'uuid' }),
    variantValue: Type.String(),
    color: Type.Optional(Type.String()),
});
const productVariantUpdateSchema = Type.Intersect([
    Type.Object({
        id: Type.Optional(Type.String({ format: 'uuid' })),
    }),
    productVariantSchema,
]);
const productDetailBase = Type.Object({
    sku: Type.Optional(Type.String()),
    barcode: Type.Optional(Type.String()),
    purchasePrice: Type.Optional(Type.Number()),
    salePrice: Type.Optional(Type.Number()),
    quantity: Type.Optional(Type.Number()),
    reOrder: Type.Optional(Type.Number()),
    productImage: Type.Optional(Type.String()),
    productAvailability: Type.Optional(Type.String()),
    expiryDate: Type.Optional(Type.String()),
});
const productDetailSchema = Type.Intersect([
    productDetailBase,
    Type.Object({
        productVariants: Type.Optional(Type.Array(productVariantSchema)),
    }),
]);
const productDetailUpdateSchema = Type.Intersect([
    Type.Object({
        id: Type.Optional(Type.String({ format: 'uuid' })),
    }),
    productDetailBase,
    Type.Object({
        productVariants: Type.Optional(Type.Array(productVariantUpdateSchema)),
    }),
]);
const productBase = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    categoryId: Type.Optional(Type.String()),
    brandId: Type.Optional(Type.String()),
    groupId: Type.Optional(Type.String()),
    purchaseUnitId: Type.Optional(Type.String()),
    saleUnitId: Type.Optional(Type.String()),
    rate: Type.Optional(Type.Number()),
    productImage: Type.Optional(Type.String()),
    taxId: Type.Optional(Type.String()),
    productType: Type.Optional(Type.String()),
    hasInitialQuantity: Type.Optional(Type.Boolean()),
    assetAccountId: Type.Optional(Type.String()),
    revenueAccountId: Type.Optional(Type.String()),
    cogsAccountId: Type.Optional(Type.String()),
    saleReturnAccountId: Type.Optional(Type.String()),
    branchId: Type.Optional(Type.String()),
    paymentType: Type.Optional(Type.String()),
    subTotal: Type.Optional(Type.Number()),
});
export const productBodySchema = Type.Intersect([
    productBase,
    Type.Object({
        productDetails: Type.Optional(Type.Array(productDetailSchema)),
    }),
]);
export const productBodyUpdateSchema = Type.Intersect([
    productBase,
    Type.Object({
        productDetails: Type.Optional(Type.Array(productDetailUpdateSchema)),
    }),
]);
export const productParamsSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
});
