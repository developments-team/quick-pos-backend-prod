import AppError from '../../utils/appError.js';
export async function getAllInventory(prisma, query) {
    const { startDate, endDate, branch, brand, category, group, search } = query;
    const productWhere = {};
    if (startDate && endDate) {
        productWhere.createdAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    if (brand && brand !== 'All')
        productWhere.brandId = brand;
    if (category && category !== 'All')
        productWhere.categoryId = category;
    if (group && group !== 'All')
        productWhere.groupId = group;
    if (search) {
        productWhere.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { productDetails: { some: { sku: { contains: search, mode: 'insensitive' } } } },
            { productDetails: { some: { barcode: { contains: search, mode: 'insensitive' } } } },
        ];
    }
    const products = await prisma.product.findMany({
        where: productWhere,
        include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            group: { select: { name: true } },
            productDetails: {
                select: {
                    id: true,
                    sku: true,
                    barcode: true,
                    purchasePrice: true,
                    salePrice: true,
                    productVariants: {
                        select: { variantId: true, variantValue: true, variant: { select: { name: true } } },
                    },
                },
                orderBy: { id: 'asc' },
                take: 1,
            },
        },
    });
    if (!products.length)
        throw new AppError('No inventory items found', 404);
    const productIds = products.map((p) => p.id);
    const stockGroups = await prisma.stockInventory.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, branchId: branch },
        _sum: { quantity: true },
    });
    const quantityMap = {};
    stockGroups.forEach((grp) => {
        if (grp.productId)
            quantityMap[grp.productId] = grp._sum.quantity || 0;
    });
    return products.map((product) => {
        const detail = product.productDetails[0];
        const variants = detail?.productVariants || [];
        const variantInfo = variants.map((v) => ({
            variantID: v.variantId,
            variantName: v.variant.name,
            variantValue: v.variantValue,
        }));
        return {
            productID: product.id,
            productName: product.name,
            sku: detail?.sku || '',
            barcode: detail?.barcode || '',
            productVariants: variantInfo,
            categoryName: product.category?.name || '',
            groupName: product.group?.name || '',
            brandName: product.brand?.name || '',
            purchasePrice: detail?.purchasePrice || 0,
            salePrice: detail?.salePrice || 0,
            inventory: quantityMap[product.id] || 0,
        };
    });
}
export async function getAllProducts(prisma, protocol, hostname) {
    const products = await prisma.product.findMany({
        include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            group: { select: { name: true } },
            purchaseUnit: { select: { name: true } },
            saleUnit: { select: { name: true } },
            productDetails: {
                select: { id: true, sku: true, barcode: true, purchasePrice: true, salePrice: true, productImage: true },
            },
        },
    });
    const detailIds = products.flatMap((p) => p.productDetails.map((d) => d.id));
    const stockGroups = await prisma.stockInventory.groupBy({
        by: ['productDetailId'],
        where: { productDetailId: { in: detailIds } },
        _sum: { quantity: true },
    });
    const detailQtyMap = {};
    stockGroups.forEach((grp) => {
        if (grp.productDetailId)
            detailQtyMap[grp.productDetailId] = grp._sum.quantity || 0;
    });
    return products.map((product) => ({
        ...product,
        productImage: product.productImage ? `${protocol}://${hostname}/${product.productImage}` : null,
        productDetails: product.productDetails.map((detail) => ({
            ...detail,
            quantity: detailQtyMap[detail.id] || 0,
            productImage: detail.productImage ? `${protocol}://${hostname}/${detail.productImage}` : null,
        })),
    }));
}
