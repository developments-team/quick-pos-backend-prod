import { TransactionStatus } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import incrementLastRef from '../../utils/genRef.js';
export async function createSaleReturn(prisma, data) {
    return await prisma.$transaction(async (tx) => {
        const defaultAccounts = await tx.defaultAccount.findMany().then((accounts) => {
            const map = new Map();
            accounts.forEach((acc) => map.set(acc.name, acc));
            return map;
        });
        const originalSale = await tx.sale.findUnique({
            where: { id: data.saleId },
            include: { saleDetails: true, customer: true },
        });
        if (!originalSale)
            throw new AppError('Original sale not found', 404);
        const lastTran = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'SR' } },
            orderBy: { ref: 'desc' },
        });
        const newRef = incrementLastRef('SR', lastTran?.ref ?? null);
        const existingReturns = await tx.saleReturn.findMany({
            where: { saleId: data.saleId },
            select: { id: true },
        });
        const returnIds = existingReturns.map((r) => r.id);
        const errors = [];
        for (const item of data.saleReturnDetails) {
            const origDetail = originalSale.saleDetails.find((od) => od.productId === item.productId && od.productDetailId === item.productDetailId);
            if (!origDetail) {
                errors.push(`Product ${item.productId} not in original sale`);
                continue;
            }
            const previouslyReturned = await tx.saleReturnDetail.aggregate({
                where: { saleReturnId: { in: returnIds }, productId: item.productId, productDetailId: item.productDetailId },
                _sum: { quantity: true },
            });
            const alreadyReturned = previouslyReturned._sum.quantity || 0;
            const remaining = origDetail.quantity - alreadyReturned;
            if (item.quantity > remaining) {
                errors.push(`Returning ${item.quantity} of ${item.productId} but only ${remaining} available`);
            }
        }
        if (errors.length)
            throw new AppError(errors.join('; '), 400);
        const saleReturn = await tx.saleReturn.create({
            data: {
                saleId: data.saleId,
                branchId: data.branchId,
                ref: newRef,
                customerId: data.customerId ?? originalSale.customerId,
                subTotal: data.subTotal,
                discount: data.discount,
                tax: data.tax,
                total: data.total,
                refund: data.refund,
                createdById: data.createdById,
            },
        });
        await tx.saleReturnDetail.createMany({
            data: data.saleReturnDetails.map((d) => ({
                saleReturnId: saleReturn.id,
                productId: d.productId,
                productDetailId: d.productDetailId,
                quantity: d.quantity,
                createdById: data.createdById,
            })),
        });
        for (const d of data.saleReturnDetails) {
            await tx.stockInventory.updateMany({
                where: { productId: d.productId, productDetailId: d.productDetailId, branchId: data.branchId },
                data: { quantity: { increment: d.quantity }, soldQuantity: { decrement: d.quantity } },
            });
        }
        const entries = [];
        entries.push({
            accountId: defaultAccounts.get('Revenue')?.accountId,
            debit: data.subTotal,
            credit: 0,
            memo: 'Sales return - revenue reversal',
        });
        if (data.tax > 0) {
            entries.push({
                accountId: defaultAccounts.get('Tax')?.accountId,
                debit: data.tax,
                credit: 0,
                memo: 'Sales return - TAX reversal',
            });
        }
        if (data.refund > 0) {
            entries.push({
                accountId: defaultAccounts.get('Cash')?.accountId,
                debit: 0,
                credit: data.refund,
                memo: 'Sales return - cash refund',
            });
        }
        const arAdjust = (data.subTotal || 0) + (data.tax || 0) - (data.refund || 0);
        if (arAdjust > 0) {
            entries.push({
                accountId: defaultAccounts.get('Receivable')?.accountId,
                debit: 0,
                credit: arAdjust,
                memo: 'Sales return - A/R adjustment',
            });
        }
        for (const d of data.saleReturnDetails) {
            const costInfo = await tx.stockInventory.findFirst({
                where: { productId: d.productId, productDetailId: d.productDetailId, branchId: data.branchId },
                select: { cost: true },
            });
            if (costInfo) {
                const costAmount = (costInfo.cost || 0) * (d.quantity || 0);
                entries.push({
                    accountId: defaultAccounts.get('Cost of Goods Sold')?.accountId,
                    debit: 0,
                    credit: costAmount,
                    memo: 'Sales return - COGS reversal',
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                }, {
                    accountId: defaultAccounts.get('Inventory')?.accountId,
                    debit: costAmount,
                    credit: 0,
                    memo: 'Sales return - Inventory increase',
                    productId: d.productId,
                    productDetailId: d.productDetailId,
                });
            }
        }
        await tx.transaction.createMany({
            data: entries.map((entry) => ({
                ref: newRef,
                tranType: 'Sales Return',
                particularId: originalSale.customerId,
                ...entry,
                status: TransactionStatus.POSTED,
                description: `Sales return for ${originalSale.customer?.name || 'customer'}`,
                createdById: data.createdById,
            })),
        });
        return saleReturn;
    });
}
