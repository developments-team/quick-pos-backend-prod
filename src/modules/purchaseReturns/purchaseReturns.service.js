import AppError from '../../utils/appError.js';
import { normalizeField as nf } from '../../utils/dataHelpers.js';
export async function getPurchaseReturns(prisma, query) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;
    const where = {};
    if (query.status)
        where.status = query.status;
    if (query.vendorId)
        where.vendorId = query.vendorId;
    if (query.branchId)
        where.branchId = query.branchId;
    if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate)
            where.createdAt.gte = new Date(query.startDate);
        if (query.endDate)
            where.createdAt.lte = new Date(query.endDate);
    }
    const [purchaseReturns, total] = await Promise.all([
        prisma.purchaseReturn.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: { select: { name: true } },
                purchase: { select: { ref: true } },
                purchaseReturnDetails: {
                    include: { product: { select: { name: true } } },
                },
            },
        }),
        prisma.purchaseReturn.count({ where }),
    ]);
    return { purchaseReturns, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
export async function getPurchaseReturnById(prisma, { id }) {
    const purchaseReturn = await prisma.purchaseReturn.findUnique({
        where: { id },
        include: {
            vendor: { select: { name: true } },
            purchase: { select: { ref: true } },
            purchaseReturnDetails: {
                include: { product: { select: { name: true } } },
            },
        },
    });
    if (!purchaseReturn)
        throw new AppError('Return purchase not found', 404);
    return purchaseReturn;
}
export async function createPurchaseReturn(prisma, data) {
    return await prisma.$transaction(async (tx) => {
        const originalPurchase = await tx.purchase.findUnique({
            where: { id: data.purchaseId },
            include: { purchaseDetails: true },
        });
        if (!originalPurchase)
            throw new AppError('Original purchase not found', 404);
        const purchaseReturn = await tx.purchaseReturn.create({
            data: {
                purchaseId: data.purchaseId,
                branchId: nf(data.branchId),
                vendorId: nf(data.vendorId) || originalPurchase.vendorId,
                totalAmount: data.totalAmount,
                paymentTypeId: data.paymentType,
                createdById: data.createdById,
            },
        });
        if (data.purchaseReturnDetails?.length) {
            await tx.purchaseReturnDetail.createMany({
                data: data.purchaseReturnDetails.map((d) => ({
                    purchaseReturnId: purchaseReturn.id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    salePrice: d.salePrice,
                    quantity: d.quantity,
                    total: d.total,
                    reason: d.reason,
                    createdById: data.createdById,
                })),
            });
            for (const d of data.purchaseReturnDetails) {
                await tx.stockInventory.updateMany({
                    where: {
                        productId: d.productId,
                        productDetailId: d.productDetailId,
                        branchId: nf(data.branchId),
                    },
                    data: { quantity: { decrement: d.quantity } },
                });
            }
        }
        return purchaseReturn;
    });
}
export async function updatePurchaseReturn(prisma, { id }, data) {
    return await prisma.$transaction(async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
            where: { id },
            include: { purchaseReturnDetails: true },
        });
        if (!purchaseReturn)
            throw new AppError('Return purchase not found', 404);
        const existingDetailsMap = new Map(purchaseReturn.purchaseReturnDetails.map((d) => [d.id, d]));
        const newDetails = data.purchaseReturnDetails || [];
        const newDetailIds = new Set(newDetails.filter((d) => d.id).map((d) => d.id));
        const toDelete = purchaseReturn.purchaseReturnDetails.filter((d) => !newDetailIds.has(d.id));
        if (toDelete.length) {
            await tx.purchaseReturnDetail.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
            for (const d of toDelete) {
                await tx.stockInventory.updateMany({
                    where: { productId: d.productId, productDetailId: d.productDetailId, branchId: purchaseReturn.branchId },
                    data: { quantity: { increment: d.quantity || 0 } },
                });
            }
        }
        const toCreate = newDetails.filter((d) => !d.id);
        if (toCreate.length) {
            await tx.purchaseReturnDetail.createMany({
                data: toCreate.map((d) => ({
                    purchaseReturnId: id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    salePrice: d.salePrice,
                    quantity: d.quantity,
                    total: d.total,
                    reason: d.reason,
                    createdById: data.updatedById,
                })),
            });
            for (const d of toCreate) {
                await tx.stockInventory.updateMany({
                    where: { productId: d.productId, productDetailId: d.productDetailId, branchId: purchaseReturn.branchId },
                    data: { quantity: { decrement: d.quantity } },
                });
            }
        }
        const toUpdate = newDetails.filter((d) => d.id && existingDetailsMap.has(d.id));
        for (const d of toUpdate) {
            const oldDetail = existingDetailsMap.get(d.id);
            if (oldDetail && oldDetail.quantity !== d.quantity) {
                const qtyDiff = d.quantity - oldDetail.quantity;
                await tx.stockInventory.updateMany({
                    where: { productId: d.productId, productDetailId: d.productDetailId, branchId: purchaseReturn.branchId },
                    data: { quantity: { decrement: qtyDiff } },
                });
            }
            await tx.purchaseReturnDetail.update({
                where: { id: d.id },
                data: {
                    salePrice: d.salePrice,
                    quantity: d.quantity,
                    total: d.total,
                    reason: d.reason,
                    updatedById: data.updatedById,
                },
            });
        }
        const updated = await tx.purchaseReturn.update({
            where: { id },
            data: { totalAmount: data.totalAmount, paymentTypeId: data.paymentType, updatedById: data.updatedById },
            include: { purchaseReturnDetails: { include: { product: { select: { name: true } } } } },
        });
        return updated;
    });
}
export async function deletePurchaseReturn(prisma, { id }) {
    return await prisma.$transaction(async (tx) => {
        const purchaseReturn = await tx.purchaseReturn.findUnique({
            where: { id },
            include: { purchaseReturnDetails: true },
        });
        if (!purchaseReturn)
            throw new AppError('Return purchase not found', 404);
        for (const d of purchaseReturn.purchaseReturnDetails) {
            await tx.stockInventory.updateMany({
                where: { productId: d.productId, productDetailId: d.productDetailId, branchId: purchaseReturn.branchId },
                data: { quantity: { increment: d.quantity || 0 } },
            });
        }
        await tx.purchaseReturnDetail.deleteMany({ where: { purchaseReturnId: id } });
        await tx.purchaseReturn.delete({ where: { id } });
        return true;
    });
}
