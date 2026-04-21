import AppError from '../../utils/appError.js';
export async function getLowStockAlerts(prisma) {
    const items = await prisma.stockInventory.findMany({
        where: { quantity: { gt: 0, lte: 3 } },
        include: {
            branch: { select: { id: true, name: true } },
            product: { select: { id: true, name: true } },
        },
        orderBy: [{ branchId: 'asc' }, { quantity: 'asc' }],
    });
    const byBranch = {};
    for (const itm of items) {
        if (!itm.branchId || !itm.productId)
            continue;
        byBranch[itm.branchId] = byBranch[itm.branchId] || [];
        byBranch[itm.branchId].push(itm);
    }
    return Object.entries(byBranch).map(([branchId, list]) => ({
        branchId,
        branchName: list[0]?.branch?.name ?? 'Branch not found',
        lowStockItems: list.slice(0, 3).map((i) => ({
            productId: i.productId,
            productName: i.product?.name ?? 'Product not found',
            quantity: i.quantity,
        })),
    }));
}
export async function getOutOfStock(prisma) {
    const items = await prisma.stockInventory.findMany({
        where: { quantity: 0 },
        include: {
            branch: { select: { id: true, name: true } },
            product: { select: { id: true, name: true } },
        },
    });
    return items.map((i) => ({
        productId: i.productId,
        productDetailId: i.productDetailId,
        productName: i.product?.name ?? 'Product not found',
        quantity: i.quantity,
        soldQuantity: i.soldQuantity,
        branchId: i.branchId,
        branchName: i.branch?.name ?? 'Branch not found',
    }));
}
export async function getTopSelling(prisma) {
    const items = await prisma.stockInventory.findMany({
        where: { soldQuantity: { gt: 0 } },
        include: {
            branch: { select: { id: true, name: true } },
            product: { select: { id: true, name: true } },
        },
        orderBy: [{ branchId: 'asc' }, { soldQuantity: 'desc' }],
    });
    const byBranch = {};
    for (const itm of items) {
        if (!itm.branchId || !itm.productId)
            continue;
        byBranch[itm.branchId] = byBranch[itm.branchId] || [];
        byBranch[itm.branchId].push(itm);
    }
    const result = Object.entries(byBranch).map(([branchId, list]) => ({
        branchId,
        branchName: list[0]?.branch?.name ?? 'Branch not found',
        topProducts: list.slice(0, 5).map((i) => ({
            productId: i.productId,
            productName: i.product?.name ?? 'Product not found',
            soldQuantity: i.soldQuantity,
        })),
    }));
    if (result.length === 0)
        throw new AppError('No top-selling products found.', 404);
    return result;
}
export async function getStockDetailReport(prisma, query) {
    const { productDetailId } = query;
    const purchases = await prisma.purchaseDetail.findMany({
        where: { productDetailId: String(productDetailId) },
        include: { purchase: { select: { branchId: true, ref: true, createdAt: true } } },
    });
    const sales = await prisma.saleDetail.findMany({
        where: { productDetailId: String(productDetailId) },
        include: { sale: { select: { branchId: true, ref: true, createdAt: true } } },
    });
    const returns = await prisma.saleReturnDetail.findMany({
        where: { productDetailId: String(productDetailId) },
        include: { saleReturn: { select: { branchId: true, ref: true, createdAt: true } } },
    });
    const allTxns = [
        ...purchases.map((pd) => ({
            branchId: pd.purchase.branchId,
            ref: pd.purchase.ref ?? 'N/A',
            transactionType: 'Purchase',
            quantity: pd.quantity ?? 0,
            createdAt: pd.purchase.createdAt,
        })),
        ...sales.map((sd) => ({
            branchId: sd.sale.branchId,
            ref: sd.sale.ref ?? 'N/A',
            transactionType: 'Sale',
            quantity: sd.quantity ?? 0,
            createdAt: sd.sale.createdAt,
        })),
        ...returns.map((rt) => ({
            branchId: rt.saleReturn.branchId,
            ref: rt.saleReturn.ref ?? 'N/A',
            transactionType: 'Sales Return',
            quantity: rt.quantity ?? 0,
            createdAt: rt.saleReturn.createdAt,
        })),
    ];
    allTxns.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const branchIds = Array.from(new Set(allTxns.map((t) => t.branchId)));
    const branches = await prisma.branch.findMany({
        where: { id: { in: branchIds } },
        select: { id: true, name: true },
    });
    const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));
    const byBranch = {};
    for (const t of allTxns) {
        byBranch[t.branchId] = byBranch[t.branchId] || [];
        byBranch[t.branchId].push(t);
    }
    return Object.entries(byBranch).map(([branchId, txns]) => {
        let running = 0;
        const detailed = txns.map((t) => {
            running += t.quantity;
            return {
                ref: t.ref,
                transactionType: t.transactionType,
                quantity: t.quantity,
                createdAt: t.createdAt,
                qtyOnHand: running,
            };
        });
        return { branchId, branchName: branchMap[branchId] ?? 'Branch not found', transactions: detailed };
    });
}
