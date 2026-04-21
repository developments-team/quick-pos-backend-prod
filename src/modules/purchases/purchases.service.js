import { TransactionStatus } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import incrementLastRef from '../../utils/genRef.js';
import { normalizeField as nf } from '../../utils/dataHelpers.js';
export async function getPurchases(prisma) {
    const purchases = await prisma.purchase.findMany({
        include: {
            branch: { select: { name: true } },
            vendor: { select: { name: true } },
            purchaseDetails: {
                include: {
                    product: { select: { name: true } },
                    productDetail: { select: { sku: true } },
                },
            },
            additionalCosts: {
                include: {
                    vendor: { select: { name: true } },
                    costType: { select: { name: true } },
                    account: { select: { accountName: true } },
                },
            },
        },
    });
    const creatorIds = [...new Set(purchases.map((p) => p.createdById).filter(Boolean))];
    const creators = creatorIds.length
        ? await prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, email: true } })
        : [];
    const creatorMap = new Map(creators.map((u) => [u.id, { email: u.email }]));
    return purchases.map((p) => ({
        ...p,
        createdBy: p.createdById ? (creatorMap.get(p.createdById) ?? null) : null,
    }));
}
export async function getPurchaseById(prisma, { id }) {
    const purchase = await prisma.purchase.findUnique({
        where: { id },
        include: {
            branch: { select: { name: true } },
            vendor: { select: { name: true } },
            purchaseDetails: {
                include: {
                    product: { select: { name: true } },
                    productDetail: { select: { sku: true } },
                },
            },
            additionalCosts: {
                include: {
                    vendor: { select: { name: true } },
                    costType: { select: { name: true } },
                    account: { select: { accountName: true } },
                },
            },
            purchaseReturns: true,
        },
    });
    if (!purchase)
        throw new AppError('No Purchase found with that ID', 404);
    const createdBy = purchase.createdById
        ? await prisma.user.findUnique({ where: { id: purchase.createdById }, select: { email: true } })
        : null;
    return { ...purchase, createdBy };
}
export async function createPurchase(prisma, data) {
    const result = await prisma.$transaction(async (tx) => {
        const defaultAccounts = new Map((await tx.defaultAccount.findMany()).map((acc) => [acc.name, acc]));
        let vendor = data.vendorId ? await tx.vendor.findUnique({ where: { id: nf(data.vendorId) } }) : null;
        if (!vendor)
            vendor = await tx.vendor.findFirst({ where: { isDefault: true } });
        if (!vendor)
            throw new AppError('No vendor found', 400);
        const lastTran = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'PUR' } },
            orderBy: { ref: 'desc' },
        });
        const ref = incrementLastRef('PUR', lastTran?.ref ?? null);
        const purchase = await tx.purchase.create({
            data: {
                ref,
                vendorId: vendor.id,
                branchId: nf(data.branchId),
                subTotal: data.subTotal,
                taxPercentage: data.taxPercentage,
                taxAmount: data.taxAmount,
                discountType: data.discountType,
                discountPercentage: data.discountPercentage,
                discountAmount: data.discountAmount,
                totalDiscountAmount: data.totalDiscountAmount,
                total: data.total,
                paid: data.paid,
                due: data.due,
                additionalCostsAmount: data.additionalCostsAmount,
                discountItemsType: data.discountItemsType,
                createdById: data.createdById,
            },
        });
        if (data.purchaseDetails?.length) {
            await tx.purchaseDetail.createMany({
                data: data.purchaseDetails.map((d) => ({
                    purchaseId: purchase.id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    quantity: d.quantity,
                    price: d.price,
                    discountType: d.discountType,
                    discountPercentage: d.discountPercentage,
                    discountAmount: d.discountAmount,
                    total: d.total,
                })),
            });
        }
        if (data.additionalCosts?.length) {
            await tx.additionalCost.createMany({
                data: data.additionalCosts.map((c) => ({
                    purchaseId: purchase.id,
                    costTypeId: c.costTypeId,
                    vendorId: c.vendorId,
                    amount: c.amount,
                    accountId: c.accountId,
                    createdById: data.createdById,
                })),
            });
        }
        const entries = [
            {
                accountId: defaultAccounts.get('Inventory')?.accountId,
                debit: data.subTotal,
                credit: 0,
                memo: 'Inventory purchase',
            },
        ];
        if (data.additionalCosts?.length) {
            for (const cost of data.additionalCosts) {
                const costType = await tx.costType.findUnique({ where: { id: cost.costTypeId } });
                const costVendor = cost.vendorId ? await tx.vendor.findUnique({ where: { id: cost.vendorId } }) : null;
                const accountId = cost.accountId
                    ? (await tx.chartOfAccount.findUnique({ where: { id: cost.accountId } }))?.id
                    : defaultAccounts.get('Additional Cost')?.accountId;
                if (accountId) {
                    entries.push({ accountId, debit: cost.amount, credit: 0, memo: `${costType?.name} expense` }, {
                        accountId: costVendor?.payableAccountId || defaultAccounts.get('Payable')?.accountId,
                        debit: 0,
                        credit: cost.amount,
                        memo: `Payable to ${costVendor?.name} for ${costType?.name}`,
                    });
                }
            }
        }
        if (data.taxAmount > 0) {
            entries.push({
                accountId: defaultAccounts.get('Tax')?.accountId,
                debit: data.taxAmount,
                credit: 0,
                memo: 'TAX on purchase',
            });
        }
        if (data.paid > 0) {
            entries.push({
                accountId: defaultAccounts.get('Cash')?.accountId,
                debit: 0,
                credit: data.paid,
                memo: 'Payment (Cash)',
            });
        }
        if (data.due > 0) {
            entries.push({
                accountId: defaultAccounts.get('Payable')?.accountId,
                debit: 0,
                credit: data.due,
                memo: 'Remaining Payable',
            });
        }
        await tx.transaction.createMany({
            data: entries.map((entry) => ({
                ref,
                tranType: 'Purchase',
                particularId: vendor.id,
                ...entry,
                status: TransactionStatus.POSTED,
                description: `Purchase transaction for vendor ${vendor.id}`,
                createdById: data.createdById,
            })),
        });
        if (data.purchaseDetails?.length) {
            for (const d of data.purchaseDetails) {
                const existing = await tx.stockInventory.findUnique({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: purchase.branchId,
                        },
                    },
                });
                const qtyOld = existing?.quantity ?? 0;
                const costOld = existing?.cost ?? 0;
                const qtyNew = qtyOld + d.quantity;
                const newCost = qtyNew > 0 ? (qtyOld * costOld + d.quantity * d.price) / qtyNew : d.price;
                await tx.stockInventory.upsert({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: purchase.branchId,
                        },
                    },
                    update: { quantity: qtyNew, cost: newCost },
                    create: {
                        productId: d.productId,
                        productDetailId: d.productDetailId,
                        branchId: purchase.branchId,
                        quantity: d.quantity,
                        cost: d.price,
                    },
                });
            }
        }
        return purchase;
    });
    return result;
}
export async function updatePurchase(prisma, { id }, data) {
    const result = await prisma.$transaction(async (tx) => {
        const existingPurchase = await tx.purchase.findUnique({
            where: { id },
            include: { purchaseDetails: true, additionalCosts: true },
        });
        if (!existingPurchase)
            throw new AppError('Purchase not found', 404);
        const defaultAccounts = new Map((await tx.defaultAccount.findMany()).map((acc) => [acc.name, acc]));
        let vendor = data.vendorId ? await tx.vendor.findUnique({ where: { id: nf(data.vendorId) } }) : null;
        if (!vendor)
            vendor = await tx.vendor.findFirst({ where: { isDefault: true } });
        if (!vendor)
            throw new AppError('No vendor found', 400);
        const purchase = await tx.purchase.update({
            where: { id },
            data: {
                vendorId: vendor.id,
                branchId: nf(data.branchId),
                subTotal: data.subTotal,
                taxPercentage: data.taxPercentage,
                taxAmount: data.taxAmount,
                discountType: data.discountType,
                discountPercentage: data.discountPercentage,
                discountAmount: data.discountAmount,
                totalDiscountAmount: data.totalDiscountAmount,
                total: data.total,
                paid: data.paid,
                due: data.due,
                additionalCostsAmount: data.additionalCostsAmount,
                discountItemsType: data.discountItemsType,
                updatedById: data.updatedById,
            },
        });
        const existingDetailIds = new Set(existingPurchase.purchaseDetails.map((d) => d.id));
        const newDetailIds = new Set(data.purchaseDetails?.filter((d) => d.id).map((d) => d.id));
        const toDelete = existingPurchase.purchaseDetails.filter((d) => !newDetailIds.has(d.id));
        if (toDelete.length) {
            await tx.purchaseDetail.deleteMany({ where: { id: { in: toDelete.map((d) => d.id) } } });
            for (const d of toDelete) {
                const existing = await tx.stockInventory.findUnique({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: existingPurchase.branchId,
                        },
                    },
                });
                if (existing) {
                    const qtyNew = existing.quantity - d.quantity;
                    if (qtyNew <= 0) {
                        await tx.stockInventory.delete({
                            where: {
                                productId_productDetailId_branchId: {
                                    productId: d.productId,
                                    productDetailId: d.productDetailId,
                                    branchId: existingPurchase.branchId,
                                },
                            },
                        });
                    }
                    else {
                        const totalValue = existing.quantity * existing.cost - d.quantity * d.price;
                        const newCost = totalValue / qtyNew;
                        await tx.stockInventory.update({
                            where: {
                                productId_productDetailId_branchId: {
                                    productId: d.productId,
                                    productDetailId: d.productDetailId,
                                    branchId: existingPurchase.branchId,
                                },
                            },
                            data: { quantity: qtyNew, cost: newCost },
                        });
                    }
                }
            }
        }
        const detailsToCreate = data.purchaseDetails?.filter((d) => !d.id) || [];
        const detailsToUpdate = data.purchaseDetails?.filter((d) => d.id && existingDetailIds.has(d.id)) || [];
        if (detailsToCreate.length) {
            await tx.purchaseDetail.createMany({
                data: detailsToCreate.map((d) => ({
                    purchaseId: purchase.id,
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                    quantity: d.quantity,
                    price: d.price,
                    discountType: d.discountType,
                    discountPercentage: d.discountPercentage,
                    discountAmount: d.discountAmount,
                    total: d.total,
                })),
            });
        }
        for (const d of detailsToUpdate) {
            await tx.purchaseDetail.update({
                where: { id: d.id },
                data: {
                    quantity: d.quantity,
                    price: d.price,
                    discountType: d.discountType,
                    discountPercentage: d.discountPercentage,
                    discountAmount: d.discountAmount,
                    total: d.total,
                },
            });
        }
        const existingCostIds = new Set(existingPurchase.additionalCosts.map((c) => c.id));
        const newCostIds = new Set(data.additionalCosts?.filter((c) => c.id).map((c) => c.id));
        const costsToDelete = existingPurchase.additionalCosts.filter((c) => !newCostIds.has(c.id));
        if (costsToDelete.length) {
            await tx.additionalCost.deleteMany({ where: { id: { in: costsToDelete.map((c) => c.id) } } });
        }
        if (data.additionalCosts?.length) {
            const costsToCreate = data.additionalCosts.filter((c) => !c.id);
            const costsToUpdate = data.additionalCosts.filter((c) => c.id && existingCostIds.has(c.id));
            if (costsToCreate.length) {
                await tx.additionalCost.createMany({
                    data: costsToCreate.map((c) => ({
                        purchaseId: purchase.id,
                        costTypeId: c.costTypeId,
                        vendorId: c.vendorId,
                        amount: c.amount,
                        accountId: c.accountId,
                        createdById: data.updatedById,
                    })),
                });
            }
            for (const c of costsToUpdate) {
                await tx.additionalCost.update({
                    where: { id: c.id },
                    data: { costTypeId: c.costTypeId, vendorId: c.vendorId, amount: c.amount, accountId: c.accountId },
                });
            }
        }
        await tx.transaction.deleteMany({ where: { ref: existingPurchase.ref } });
        const entries = [
            {
                accountId: defaultAccounts.get('Inventory')?.accountId,
                debit: data.subTotal,
                credit: 0,
                memo: 'Inventory purchase',
            },
        ];
        if (data.taxAmount > 0) {
            entries.push({
                accountId: defaultAccounts.get('Tax')?.accountId,
                debit: data.taxAmount,
                credit: 0,
                memo: 'TAX on purchase',
            });
        }
        if (data.paid > 0) {
            entries.push({
                accountId: defaultAccounts.get('Cash')?.accountId,
                debit: 0,
                credit: data.paid,
                memo: 'Payment (Cash)',
            });
        }
        if (data.due > 0) {
            entries.push({
                accountId: defaultAccounts.get('Payable')?.accountId,
                debit: 0,
                credit: data.due,
                memo: 'Remaining Payable',
            });
        }
        await tx.transaction.createMany({
            data: entries.map((entry) => ({
                ref: existingPurchase.ref,
                tranType: 'Purchase',
                particularId: vendor.id,
                ...entry,
                status: TransactionStatus.POSTED,
                description: `Purchase transaction for vendor ${vendor.id}`,
                createdById: data.updatedById,
            })),
        });
        const allDetails = await tx.purchaseDetail.findMany({ where: { purchaseId: purchase.id } });
        for (const d of allDetails) {
            const oldDetail = existingPurchase.purchaseDetails.find((ed) => ed.productId === d.productId && ed.productDetailId === d.productDetailId);
            const existing = await tx.stockInventory.findUnique({
                where: {
                    productId_productDetailId_branchId: {
                        productId: d.productId,
                        productDetailId: d.productDetailId,
                        branchId: purchase.branchId,
                    },
                },
            });
            if (oldDetail) {
                const qtyOld = existing?.quantity ?? 0;
                const costOld = existing?.cost ?? 0;
                const qtyDiff = d.quantity - oldDetail.quantity;
                const qtyNew = qtyOld + qtyDiff;
                if (qtyNew <= 0) {
                    if (existing) {
                        await tx.stockInventory.delete({
                            where: {
                                productId_productDetailId_branchId: {
                                    productId: d.productId,
                                    productDetailId: d.productDetailId,
                                    branchId: purchase.branchId,
                                },
                            },
                        });
                    }
                }
                else {
                    const totalValue = qtyOld * costOld - oldDetail.quantity * oldDetail.price + d.quantity * d.price;
                    const newCost = totalValue / qtyNew;
                    await tx.stockInventory.upsert({
                        where: {
                            productId_productDetailId_branchId: {
                                productId: d.productId,
                                productDetailId: d.productDetailId,
                                branchId: purchase.branchId,
                            },
                        },
                        update: { quantity: qtyNew, cost: newCost },
                        create: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: purchase.branchId,
                            quantity: d.quantity,
                            cost: d.price,
                        },
                    });
                }
            }
            else {
                const qtyOld = existing?.quantity ?? 0;
                const costOld = existing?.cost ?? 0;
                const qtyNew = qtyOld + d.quantity;
                const newCost = qtyNew > 0 ? (qtyOld * costOld + d.quantity * d.price) / qtyNew : d.price;
                await tx.stockInventory.upsert({
                    where: {
                        productId_productDetailId_branchId: {
                            productId: d.productId,
                            productDetailId: d.productDetailId,
                            branchId: purchase.branchId,
                        },
                    },
                    update: { quantity: qtyNew, cost: newCost },
                    create: {
                        productId: d.productId,
                        productDetailId: d.productDetailId,
                        branchId: purchase.branchId,
                        quantity: d.quantity,
                        cost: d.price,
                    },
                });
            }
        }
        return purchase;
    });
    return result;
}
export async function deletePurchase(prisma, { id }) {
    await prisma.purchaseDetail.deleteMany({ where: { purchaseId: id } });
    await prisma.additionalCost.deleteMany({ where: { purchaseId: id } });
    return await prisma.purchase.delete({ where: { id } });
}
