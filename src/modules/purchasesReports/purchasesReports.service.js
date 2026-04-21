import AppError from '../../utils/appError.js';
const validateDate = (date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
};
export async function getPurchasesDetailsPerVendor(prisma, vendorId, query) {
    const { fromDate, toDate } = query;
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const purchases = await prisma.purchase.findMany({
        where: {
            vendorId,
            createdAt: { gte: new Date(fromDate), lte: new Date(toDate) },
        },
        include: {
            vendor: { select: { name: true } },
            purchaseDetails: { include: { product: { select: { name: true } } } },
        },
        orderBy: { vendor: { name: 'asc' } },
    });
    const byRef = purchases.reduce((acc, purchase) => {
        const ref = purchase.ref ?? purchase.id;
        if (!acc[ref]) {
            acc[ref] = {
                ref,
                vendorName: purchase.vendor?.name ?? null,
                totalAmount: 0,
                totalDiscount: purchase.discountAmount,
                totalVat: 0,
                items: [],
            };
        }
        acc[ref].totalVat += purchase.taxAmount ?? 0;
        for (const d of purchase.purchaseDetails) {
            const qty = d.quantity ?? 0;
            const rate = d.price ?? 0;
            const lineAmt = qty * rate;
            acc[ref].totalAmount += lineAmt;
            acc[ref].items.push({ product: d.product?.name ?? null, quantity: qty, rate: rate, amount: lineAmt });
        }
        return acc;
    }, {});
    return Object.values(byRef);
}
export async function getPurchasesSummaryPerVendor(prisma, vendorId, query) {
    const { fromDate, toDate } = query;
    if (!validateDate(fromDate) || !validateDate(toDate))
        throw new AppError('Invalid date format. Please use YYYY-MM-DD', 400);
    const summary = await prisma.purchase.groupBy({
        by: ['vendorId'],
        where: { vendorId, createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
        _sum: { subTotal: true, discountAmount: true, taxAmount: true, total: true },
        orderBy: { vendorId: 'asc' },
    });
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId }, select: { name: true } });
    return summary.map((grp) => ({
        vendorName: vendor?.name ?? null,
        totalAmount: grp._sum.subTotal ?? 0,
        totalDiscount: grp._sum.discountAmount ?? 0,
        totalVat: grp._sum.taxAmount ?? 0,
        totalPurchase: grp._sum.total ?? 0,
    }));
}
