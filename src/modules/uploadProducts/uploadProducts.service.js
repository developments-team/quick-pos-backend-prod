import AppError from '../../utils/appError.js';
import { normalizeField as nf } from '../../utils/dataHelpers.js';
import sharp from 'sharp';
import { uploadImage } from '../../config/cloudinaryConfig.js';
export async function uploadProducts(prisma, data, userId) {
    const { products } = data;
    if (!Array.isArray(products) || products.length === 0)
        throw new AppError('No products provided', 400);
    const categoryNames = [...new Set(products.map((p) => p.category?.trim()))];
    const brandNames = [...new Set(products.map((p) => p.brand?.trim()))];
    const groupNames = [...new Set(products.map((p) => p.group?.trim()))];
    const unitNames = [...new Set(products.flatMap((p) => [p.purchaseUnit?.trim(), p.saleUnit?.trim()]))];
    const variantNames = [
        ...new Set(products.flatMap((p) => p.productDetails?.flatMap((d) => d.productVariants?.map((pv) => pv.variantName?.trim()) ?? []) ?? [])),
    ];
    const [categories, brands, groups, units, variants] = await Promise.all([
        prisma.category.findMany({
            where: { name: { in: categoryNames, mode: 'insensitive' } },
            select: { id: true, name: true },
        }),
        prisma.brand.findMany({
            where: { name: { in: brandNames, mode: 'insensitive' } },
            select: { id: true, name: true },
        }),
        prisma.group.findMany({
            where: { name: { in: groupNames, mode: 'insensitive' } },
            select: { id: true, name: true },
        }),
        prisma.unit.findMany({
            where: { name: { in: unitNames, mode: 'insensitive' } },
            select: { id: true, name: true },
        }),
        prisma.variantAttribute.findMany({
            where: { name: { in: variantNames.filter(Boolean), mode: 'insensitive' } },
            select: { id: true, name: true },
        }),
    ]);
    const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
    const brandMap = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
    const groupMap = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));
    const unitMap = new Map(units.map((u) => [u.name.toLowerCase(), u.id]));
    const variantMap = new Map(variants.map((v) => [v.name.toLowerCase(), v.id]));
    for (const name of categoryNames) {
        if (name && !categoryMap.has(name.toLowerCase())) {
            const created = await prisma.category.create({ data: { name, createdById: userId } });
            categoryMap.set(name.toLowerCase(), created.id);
        }
    }
    for (const name of brandNames) {
        if (name && !brandMap.has(name.toLowerCase())) {
            const created = await prisma.brand.create({ data: { name, createdById: userId } });
            brandMap.set(name.toLowerCase(), created.id);
        }
    }
    for (const name of groupNames) {
        if (name && !groupMap.has(name.toLowerCase())) {
            const created = await prisma.group.create({ data: { name, createdById: userId } });
            groupMap.set(name.toLowerCase(), created.id);
        }
    }
    for (const name of unitNames) {
        if (name && !unitMap.has(name.toLowerCase())) {
            const created = await prisma.unit.create({ data: { name, shortName: name, createdById: userId } });
            unitMap.set(name.toLowerCase(), created.id);
        }
    }
    for (const name of variantNames) {
        if (name && !variantMap.has(name.toLowerCase())) {
            const created = await prisma.variantAttribute.create({ data: { name, createdById: userId } });
            variantMap.set(name.toLowerCase(), created.id);
        }
    }
    const productsToCreate = [];
    for (const row of products) {
        const { name, category, brand, group, purchaseUnit, saleUnit, rate, productType, productDetails } = row;
        productsToCreate.push({
            productData: {
                name,
                categoryId: categoryMap.get(category.toLowerCase()),
                brandId: brandMap.get(brand.toLowerCase()),
                groupId: groupMap.get(group.toLowerCase()),
                purchaseUnitId: unitMap.get(purchaseUnit.toLowerCase()),
                saleUnitId: unitMap.get(saleUnit.toLowerCase()),
                rate: Number(rate),
                productType,
                createdById: nf(userId),
            },
            productDetails,
        });
    }
    await prisma.$transaction(async (tx) => {
        for (const { productData, productDetails } of productsToCreate) {
            const product = await tx.product.create({ data: productData });
            if (productDetails?.length) {
                const detailsData = productDetails.map((d) => ({
                    productId: product.id,
                    purchasePrice: Number(d.purchasePrice),
                    salePrice: Number(d.salePrice),
                    sku: d.sku,
                    barcode: d.barcode,
                    reOrder: Number(d.reOrder || 0),
                    createdById: nf(userId),
                }));
                const createdDetails = await tx.productDetail.createManyAndReturn({ data: detailsData });
                const allVariants = [];
                for (let i = 0; i < productDetails.length; i++) {
                    if (productDetails[i].productVariants?.length) {
                        for (const pv of productDetails[i].productVariants) {
                            allVariants.push({
                                productDetailId: createdDetails[i].id,
                                variantId: variantMap.get(pv.variantName.toLowerCase()),
                                variantValue: pv.variantValue,
                            });
                        }
                    }
                }
                if (allVariants.length) {
                    await tx.productVariant.createMany({ data: allVariants });
                }
            }
        }
    }, { timeout: 60000, maxWait: 5000 });
    return { successfullyUploaded: products.length, failedUploaded: 0, data: [] };
}
export async function checkProductSKUs(prisma, skus) {
    if (!Array.isArray(skus) || skus.length === 0)
        throw new AppError('No SKUs provided', 400);
    const skuValues = skus.map((s) => s.sku?.trim()).filter(Boolean);
    const foundDetails = await prisma.productDetail.findMany({
        where: { sku: { in: skuValues } },
        select: { sku: true },
    });
    const foundSet = new Set(foundDetails.map((d) => d.sku));
    return skuValues.map((sku) => ({ sku, exists: foundSet.has(sku) }));
}
export async function processUploadProductsImages(parts) {
    const rawData = { products: [] };
    for await (const part of parts) {
        const match = part.fieldname.match(/^products\[(\d+)\]\.(.+)$/);
        if (match) {
            const index = parseInt(match[1], 10);
            const key = match[2];
            if (part.file) {
                let buffer = await part.toBuffer();
                const maxSize = 1 * 1024 * 1024;
                if (buffer.length > maxSize) {
                    buffer = await sharp(buffer).jpeg({ quality: 80, progressive: true }).toBuffer();
                    if (buffer.length > maxSize) {
                        const metadata = await sharp(buffer).metadata();
                        const scale = Math.sqrt(maxSize / buffer.length) * 0.9;
                        buffer = await sharp(buffer)
                            .resize(Math.floor(metadata.width * scale), Math.floor(metadata.height * scale))
                            .jpeg({ quality: 70 })
                            .toBuffer();
                    }
                }
                const cloudinaryResult = await uploadImage(buffer, 'products');
                const url = cloudinaryResult.secure_url;
                rawData.products[index] = { ...rawData.products[index], [key]: url };
            }
            else {
                rawData.products[index] = { ...rawData.products[index], [key]: part.value };
            }
        }
        else {
            rawData[part.fieldname] = part.value;
        }
    }
    return rawData;
}
export async function saveProductsImages(prisma, data, userId) {
    if (data.products.length === 0) {
        return { status: false, message: 'No products found', data };
    }
    for (const prd of data.products) {
        if (!prd.sku || !prd.productImage)
            continue;
        const productDetail = await prisma.productDetail.findUnique({ where: { sku: prd.sku } });
        if (!productDetail)
            continue;
        const product = await prisma.product.findUnique({ where: { id: productDetail.productId } });
        if (!product)
            continue;
        if (product.productType === 'standard') {
            await prisma.product.update({
                where: { id: productDetail.productId },
                data: { productImage: prd.productImage },
            });
        }
        else if (product.productType === 'variant') {
            await prisma.productDetail.update({
                where: { id: productDetail.id },
                data: { productImage: prd.productImage },
            });
            const firstVariant = await prisma.productDetail.findFirst({
                where: { productId: productDetail.productId },
                orderBy: { id: 'asc' },
            });
            if (firstVariant?.productImage) {
                await prisma.product.update({
                    where: { id: productDetail.productId },
                    data: { productImage: firstVariant.productImage },
                });
            }
        }
    }
    return { status: true, message: 'Upload successful', data };
}
