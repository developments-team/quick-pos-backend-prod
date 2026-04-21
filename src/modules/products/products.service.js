import { TransactionStatus } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import incrementLastref from '../../utils/genRef.js';
export async function createProduct(prisma, data) {
    const prodData = {
        ...data,
        productDetails: {
            create: data.productDetails?.map((detail) => ({
                ...detail,
                createdById: data.createdById,
                productVariants: detail.productVariants?.map((v) => ({
                    ...v,
                })),
            })),
        },
    };
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
            data: prodData,
            include: {
                category: true,
                brand: true,
                group: true,
                purchaseUnit: true,
                saleUnit: true,
                tax: true,
                assetAccount: true,
                revenueAccount: true,
                cogsAccount: true,
                saleReturnAccount: true,
                productDetails: { include: { productVariants: true } },
            },
        });
        if (product.hasInitialQuantity) {
            const defaultAccounts = await tx.defaultAccount.findMany().then((accounts) => {
                const map = new Map();
                accounts.forEach((acc) => map.set(acc.name, acc));
                return map;
            });
            if (!defaultAccounts?.get('inventory-merchandise-stock'))
                throw new AppError('Setup account not configured properly.', 500);
            const lastItem = await tx.transaction.findFirst({
                where: { ref: { startsWith: 'INV' } },
                orderBy: { ref: 'desc' },
            });
            const newref = incrementLastref('INV', lastItem?.ref);
            await tx.transaction.createMany({
                data: [
                    {
                        ref: newref,
                        tranType: 'Product',
                        productId: product.id,
                        accountId: defaultAccounts.get('inventory-merchandise-stock')?.accountId,
                        debit: data.subTotal,
                        credit: 0.0,
                        status: TransactionStatus.POSTED,
                        description: `Product registration`,
                        memo: 'inventory',
                        createdById: data.createdById,
                    },
                    {
                        ref: newref,
                        tranType: 'Product',
                        productId: product.id,
                        accountId: data.paymentType === 'Cash'
                            ? defaultAccounts.get('cash-on-hand')?.accountId
                            : defaultAccounts.get('accounts-payable')?.accountId,
                        debit: 0.0,
                        credit: data.subTotal,
                        status: TransactionStatus.POSTED,
                        description: `Product registration`,
                        memo: 'asset or liability',
                        createdById: data.createdById,
                    },
                ],
            });
            const stocks = await tx.stockInventory.findMany({
                where: { productDetailId: { in: product.productDetails.map((d) => d.id) }, branchId: data.branchId },
            });
            const stockMap = new Map(stocks.map((s) => [s.productDetailId, s]));
            await Promise.all(product.productDetails.map((d) => {
                const existing = stockMap.get(d.id) ?? { quantity: 0, cost: 0 };
                const qty = existing.quantity + d.quantity;
                const avgCost = qty
                    ? (existing.cost * existing.quantity + d.purchasePrice * d.quantity) / qty
                    : d.purchasePrice;
                return tx.stockInventory.upsert({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: product.id,
                            productDetailId: d.id,
                            branchId: data.branchId,
                        },
                    },
                    update: { quantity: qty, cost: avgCost },
                    create: {
                        productId: product.id,
                        productDetailId: d.id,
                        branchId: data.branchId,
                        quantity: d.quantity,
                        cost: d.purchasePrice,
                    },
                });
            }));
        }
        return product;
    });
}
export async function getProducts(prisma) {
    const products = await prisma.product.findMany({
        include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            group: { select: { name: true } },
            purchaseUnit: { select: { name: true } },
            saleUnit: { select: { name: true } },
            tax: { select: { name: true } },
            assetAccount: { select: { accountName: true } },
            revenueAccount: { select: { accountName: true } },
            cogsAccount: { select: { accountName: true } },
            saleReturnAccount: { select: { accountName: true } },
            productDetails: {
                include: {
                    productVariants: { include: { variant: { select: { name: true } } } },
                    stockInventories: { select: { quantity: true } },
                },
            },
        },
    });
    const creatorIds = [...new Set(products.map((p) => p.createdById).filter(Boolean))];
    const creators = creatorIds.length
        ? await prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, email: true } })
        : [];
    const creatorMap = new Map(creators.map((u) => [u.id, { email: u.email }]));
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        product.createdBy = product.createdById ? (creatorMap.get(product.createdById) ?? null) : null;
        let totalStockAcrossDetails = 0;
        const details = product.productDetails;
        for (let j = 0; j < details.length; j++) {
            const detail = details[j];
            const stockItem = detail.stockInventories?.[0];
            const stockQty = stockItem ? stockItem.quantity : 0;
            detail.currentStock = stockQty;
            totalStockAcrossDetails += stockQty;
        }
        product.outOfStock = totalStockAcrossDetails <= 0;
    }
    return products;
}
export async function getProductById(prisma, { id }) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            group: { select: { name: true } },
            purchaseUnit: { select: { name: true } },
            saleUnit: { select: { name: true } },
            tax: { select: { name: true } },
            assetAccount: { select: { accountName: true } },
            revenueAccount: { select: { accountName: true } },
            cogsAccount: { select: { accountName: true } },
            saleReturnAccount: { select: { accountName: true } },
            productDetails: {
                include: { productVariants: { include: { variant: { select: { name: true } } } } },
            },
        },
    });
    if (!product)
        throw new AppError('No product found with that ID', 404);
    const createdBy = product.createdById
        ? await prisma.user.findUnique({ where: { id: product.createdById }, select: { email: true } })
        : null;
    const detailsWithStock = await Promise.all((product.productDetails || []).map(async (detail) => {
        const stock = await prisma.stockInventory.findFirst({
            where: { productDetailId: detail.id },
            select: { quantity: true },
        });
        return { ...detail, currentStock: stock?.quantity || 0 };
    }));
    const hasStock = detailsWithStock.some((d) => d.currentStock > 0);
    return { ...product, productDetails: detailsWithStock, outOfStock: !hasStock, createdBy };
}
export async function updateProduct(prisma, { id }, data) {
    const now = new Date();
    const { productDetails, ...rest } = data;
    return await prisma.$transaction(async (tx) => {
        if (Array.isArray(productDetails)) {
            const incomingIds = productDetails.map((d) => d.id).filter((id) => Boolean(id));
            await tx.productDetail.deleteMany({ where: { productId: id, id: { notIn: incomingIds } } });
            for (const detail of productDetails) {
                const { productVariants, ...rest } = detail;
                let currentDetailId;
                if (detail.id) {
                    await tx.productDetail.update({
                        where: { id: detail.id },
                        data: {
                            ...rest,
                            updatedById: data.updatedById,
                            updatedAt: now,
                        },
                    });
                    currentDetailId = detail.id;
                }
                else {
                    const newDetail = await tx.productDetail.create({
                        data: {
                            productId: id,
                            ...rest,
                            createdById: data.updatedById,
                        },
                    });
                    currentDetailId = newDetail.id;
                }
                if (Array.isArray(productVariants)) {
                    const incomingVariantIds = productVariants
                        .map((v) => v.id)
                        .filter((id) => Boolean(id));
                    await tx.productVariant.deleteMany({
                        where: { productDetailId: currentDetailId, id: { notIn: incomingVariantIds } },
                    });
                    for (const variant of productVariants) {
                        if (variant.id) {
                            await tx.productVariant.update({
                                where: { id: variant.id },
                                data: { variantId: variant.variantId, variantValue: variant.variantValue, color: variant.color },
                            });
                        }
                        else {
                            await tx.productVariant.create({
                                data: {
                                    productDetailId: currentDetailId,
                                    ...variant,
                                },
                            });
                        }
                    }
                }
            }
        }
        return await tx.product.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                brandId: data.brandId,
                groupId: data.groupId,
                purchaseUnitId: data.purchaseUnitId,
                saleUnitId: data.saleUnitId,
                taxId: data.taxId,
                productImage: data.productImage,
                rate: data.rate,
                productType: data.productType,
                hasInitialQuantity: data.hasInitialQuantity,
                updatedById: data.updatedById,
                updatedAt: now,
            },
            include: {
                category: true,
                brand: true,
                group: true,
                purchaseUnit: true,
                saleUnit: true,
                tax: true,
                assetAccount: true,
                revenueAccount: true,
                cogsAccount: true,
                saleReturnAccount: true,
                productDetails: { include: { productVariants: true } },
            },
        });
    });
}
export async function deleteProduct(prisma, { id }) {
    return await prisma.product.delete({ where: { id } });
}
export async function getProductsByCategory(prisma, categoryId) {
    const products = await prisma.product.findMany({
        where: { categoryId },
        include: {
            category: { select: { name: true } },
            brand: { select: { name: true } },
            group: { select: { name: true } },
            purchaseUnit: { select: { name: true } },
            saleUnit: { select: { name: true } },
            productDetails: { include: { productVariants: true } },
        },
    });
    const stockData = await prisma.stockInventory.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        where: { productId: { in: products.map((p) => p.id) } },
    });
    const stockMap = new Map();
    stockData.forEach(({ productId, _sum }) => {
        if (productId)
            stockMap.set(productId, _sum.quantity ?? 0);
    });
    return products.map((product) => {
        const totalQuantity = stockMap.get(product.id) || 0;
        return {
            ...product,
            productImage: product.productImage || null,
            productDetails: product.productDetails.map((detail) => ({
                ...detail,
                productImage: detail.productImage || null,
            })),
            outOfStock: totalQuantity <= 0,
        };
    });
}
