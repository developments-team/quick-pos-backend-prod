import { Type } from '../../utils/schema.js';
export const productVariantUploadSchema = Type.Object({
    variantName: Type.String(),
    variantValue: Type.String(),
});
export const productDetailUploadSchema = Type.Object({
    purchasePrice: Type.Union([Type.Number(), Type.String()]),
    salePrice: Type.Union([Type.Number(), Type.String()]),
    sku: Type.Optional(Type.String()),
    barcode: Type.Optional(Type.String()),
    reOrder: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    productVariants: Type.Optional(Type.Array(productVariantUploadSchema)),
});
export const productUploadSchema = Type.Object({
    name: Type.String(),
    category: Type.String(),
    brand: Type.String(),
    group: Type.String(),
    purchaseUnit: Type.String(),
    saleUnit: Type.String(),
    rate: Type.Union([Type.Number(), Type.String()]),
    productType: Type.String(),
    productDetails: Type.Optional(Type.Array(productDetailUploadSchema)),
});
export const uploadProductsBodySchema = Type.Object({
    products: Type.Array(productUploadSchema),
});
export const checkSkusBodySchema = Type.Array(Type.Object({
    sku: Type.String(),
}));
export const uploadProductsImagesBodySchema = Type.Object({
    products: Type.Array(Type.Object({
        sku: Type.Optional(Type.String()),
        productImage: Type.Optional(Type.String()),
    })),
});
