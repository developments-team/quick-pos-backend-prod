import AppError from '../../utils/appError.js';
function calculateProfitFromTransactions(transactions, revenueAcc, cogsAcc) {
    let revenue = 0;
    let cogs = 0;
    for (const tran of transactions) {
        if (tran.accountId === revenueAcc)
            revenue += tran.credit ?? 0;
        if (tran.accountId === cogsAcc)
            cogs += tran.debit ?? 0;
    }
    return { sales: revenue, profit: revenue - cogs };
}
async function getDefaultAccounts(prisma) {
    const accounts = await prisma.defaultAccount.findMany();
    const map = new Map();
    accounts.forEach((acc) => map.set(acc.name, acc));
    return map;
}
export async function getDashboardSummary(prisma) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const defaultAccounts = await getDefaultAccounts(prisma);
    if (!defaultAccounts)
        throw new AppError('SetupAccount not found', 500);
    const revenueAcc = defaultAccounts?.get('Sales Revenue')?.accountId;
    const cogsAcc = defaultAccounts?.get('Cost of Goods Sold')?.accountId;
    const fetchMetrics = async (start, end) => {
        const trans = await prisma.transaction.findMany({
            where: { tranType: 'Sales', jourDate: { gte: start, lt: end } },
        });
        return calculateProfitFromTransactions(trans, revenueAcc, cogsAcc);
    };
    const [todayMetrics, last30Metrics, totalMetrics] = await Promise.all([
        fetchMetrics(today, tomorrow),
        fetchMetrics(thirtyDaysAgo, tomorrow),
        fetchMetrics(new Date(2000, 0, 1), tomorrow),
    ]);
    const yearlyTrans = await prisma.transaction.findMany({
        where: {
            tranType: 'Sales',
            jourDate: { gte: startOfYear, lt: new Date(today.getFullYear() + 1, 0, 1) },
        },
        select: { jourDate: true, accountId: true, debit: true, credit: true },
    });
    const monthlyData = Array.from({ length: 12 }, () => ({ sales: 0, profit: 0 }));
    for (const tran of yearlyTrans) {
        const month = tran.jourDate.getMonth();
        if (tran.accountId === revenueAcc)
            monthlyData[month].sales += tran.credit ?? 0;
        if (tran.accountId === cogsAcc)
            monthlyData[month].profit -= tran.debit ?? 0;
    }
    monthlyData.forEach((m) => (m.profit = m.sales + m.profit));
    const last7Trans = await prisma.transaction.findMany({
        where: { tranType: 'Sales', jourDate: { gte: sevenDaysAgo, lt: tomorrow } },
        select: { jourDate: true, accountId: true, debit: true, credit: true },
    });
    const dailyProfitData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().slice(0, 10), profit: 0 };
    });
    const dateToIndex = {};
    dailyProfitData.forEach((d, i) => (dateToIndex[d.date] = i));
    for (const tran of last7Trans) {
        const ds = tran.jourDate.toISOString().slice(0, 10);
        if (ds in dateToIndex) {
            let rev = 0, cost = 0;
            if (tran.accountId === revenueAcc)
                rev += tran.credit ?? 0;
            if (tran.accountId === cogsAcc)
                cost += tran.debit ?? 0;
            dailyProfitData[dateToIndex[ds]].profit += rev - cost;
        }
    }
    const [totalCustomers, totalVendors, totalUsers, totalProducts] = await Promise.all([
        prisma.customer.count(),
        prisma.vendor.count(),
        prisma.user.count(),
        prisma.product.count(),
    ]);
    return {
        today: { sales: todayMetrics.sales.toFixed(2), profit: todayMetrics.profit.toFixed(2) },
        last30Days: { sales: last30Metrics.sales.toFixed(2), profit: last30Metrics.profit.toFixed(2) },
        total: { sales: totalMetrics.sales.toFixed(2), profit: totalMetrics.profit.toFixed(2) },
        yearlyStats: {
            monthly: monthlyData.map((m, i) => ({
                month: new Date(0, i).toLocaleString('default', { month: 'short' }),
                sales: m.sales.toFixed(2),
                profit: m.profit.toFixed(2),
            })),
        },
        weeklyProfit: dailyProfitData,
        totals: { customers: totalCustomers, vendors: totalVendors, users: totalUsers, products: totalProducts },
    };
}
export async function getSalesTrends(prisma, period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate;
    switch (period) {
        case 'daily':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'weekly':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 28);
            break;
        case 'monthly':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 12);
            break;
        default:
            throw new AppError('Invalid period', 400);
    }
    const defaultAccounts = await getDefaultAccounts(prisma);
    const revenueAcc = defaultAccounts.get('Sales Revenue')?.accountId;
    const trans = await prisma.transaction.findMany({
        where: { tranType: 'Sales', jourDate: { gte: startDate }, accountId: revenueAcc },
        select: { jourDate: true, accountId: true, debit: true, credit: true },
    });
    const trends = {};
    for (const t of trans) {
        let key;
        const d = t.jourDate;
        if (period === 'daily') {
            key = d.toISOString().slice(0, 10);
        }
        else if (period === 'weekly') {
            const oneJan = new Date(d.getFullYear(), 0, 1);
            const week = Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
            key = `${d.getFullYear()}-W${week}`;
        }
        else {
            key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        const sumCredit = t.accountId === revenueAcc ? (t.credit ?? 0) : 0;
        trends[key] = (trends[key] || 0) + sumCredit;
    }
    return Object.entries(trends)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([periodLabel, sales]) => ({ period: periodLabel, sales }));
}
export async function getCustomerInsights(prisma) {
    const raw = await prisma.sale.groupBy({
        by: ['customerId'],
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
    });
    return Promise.all(raw.map(async (r) => {
        const cust = await prisma.customer.findUnique({ where: { id: r.customerId ?? undefined } });
        return { customerName: cust?.name || 'Unknown', totalSpent: r._sum?.total ?? 0, purchaseCount: r._count };
    }));
}
export async function getSalesByUser(prisma) {
    const raw = await prisma.sale.groupBy({
        by: ['createdById'],
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
    });
    return Promise.all(raw.map(async (r) => {
        const user = await prisma.user.findFirst();
        return { email: user?.email || 'Unknown', totalSales: r._sum?.total ?? 0, count: r._count };
    }));
}
export async function getTopProducts(prisma) {
    const raw = await prisma.saleDetail.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
    });
    return Promise.all(raw.map(async (r) => {
        const prod = await prisma.product.findUnique({ where: { id: r.productId } });
        return { id: prod?.id, name: prod?.name || 'Unknown', totalQuantity: r._sum?.quantity };
    }));
}
export async function getOutOfStockProducts(prisma) {
    const inv = await prisma.stockInventory.groupBy({
        by: ['productDetailId'],
        _sum: { quantity: true },
    });
    const out = inv.filter((i) => (i._sum?.quantity ?? 0) === 0);
    return Promise.all(out.map(async (i) => {
        const detail = await prisma.productDetail.findUnique({ where: { id: i.productDetailId ?? undefined } });
        const prod = detail ? await prisma.product.findUnique({ where: { id: detail.productId } }) : null;
        return { productID: prod?.id, productDetailID: i.productDetailId, name: prod?.name, soldQty: 0 };
    }));
}
export async function getInventoryStatus(prisma) {
    const threshold = 5;
    const inv = await prisma.stockInventory.groupBy({
        by: ['productDetailId'],
        _sum: { quantity: true },
    });
    const total = inv.length;
    const inStock = inv.filter((i) => (i._sum?.quantity ?? 0) > threshold).length;
    const lowStock = inv.filter((i) => (i._sum?.quantity ?? 0) > 0 && (i._sum?.quantity ?? 0) <= threshold).length;
    const outOfStock = inv.filter((i) => (i._sum?.quantity ?? 0) === 0).length;
    return { total, inStock, lowStock, outOfStock };
}
