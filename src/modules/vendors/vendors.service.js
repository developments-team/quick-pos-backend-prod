import AppError from '../../utils/appError.js';
export async function createVendor(prisma, data) {
    return await prisma.vendor.create({
        data: { ...data, vendorType: data.vendorType },
    });
}
export async function getVendors(prisma) {
    return await prisma.vendor.findMany({
        where: { name: { not: 'Direct Purchase' } },
        include: { payableAccount: true },
    });
}
export async function getVendorById(prisma, { id }) {
    return await prisma.vendor.findUnique({
        where: { id },
        include: { payableAccount: true, payments: true, purchases: true, purchaseReturns: true },
    });
}
export async function updateVendor(prisma, { id }, data) {
    return await prisma.vendor.update({
        where: { id },
        data: { ...data, vendorType: data.vendorType },
    });
}
export async function deleteVendor(prisma, { id }) {
    const vendor = await prisma.vendor.findUnique({ where: { id, isDefault: true } });
    if (vendor)
        throw new AppError('Default vendors cannot be deleted', 400);
    return await prisma.vendor.delete({ where: { id } });
}
export async function getVendorsByType(prisma, type) {
    return await prisma.vendor.findMany({ where: { vendorType: type } });
}
const formatDate = (date) => new Date(date).toLocaleDateString('en-GB');
export async function getVendorStatementSummary(prisma, { id }, fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new AppError('Invalid date format. Please use YYYY-MM-DD format', 400);
    }
    const totalPayments = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { vendorId: id, createdAt: { lt: to } },
    });
    const totalPurchases = await prisma.purchase.aggregate({
        _sum: { due: true },
        where: { vendorId: id, createdAt: { lt: to } },
    });
    const prevBalance = (totalPayments._sum.amount || 0) - (totalPurchases._sum.due || 0);
    const [payments, purchases] = await Promise.all([
        prisma.payment.findMany({
            where: { vendorId: id, createdAt: { gte: from, lte: to } },
            select: { paymentDate: true, ref: true, amount: true },
        }),
        prisma.purchase.findMany({
            where: { vendorId: id, createdAt: { gte: from, lte: to }, due: { gt: 0 } },
            select: { createdAt: true, ref: true, due: true },
        }),
    ]);
    const formattedPayments = payments.map((p) => ({
        date: p.paymentDate,
        reference: p.ref ? `${p.ref} (Payment)` : 'Payment',
        amount: p.amount,
    }));
    const formattedPurchases = purchases.map((p) => ({
        date: p.createdAt,
        reference: p.ref ? `${p.ref} (Purchase)` : 'Purchase',
        amount: -(p.due ?? 0),
    }));
    const transactions = [...formattedPayments, ...formattedPurchases].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningBalance = prevBalance;
    const ledger = [{ date: formatDate(from), reference: 'PREV. BALANCE', amount: prevBalance, balance: prevBalance }];
    for (const tx of transactions) {
        runningBalance += tx.amount;
        ledger.push({ date: formatDate(tx.date), reference: tx.reference, amount: tx.amount, balance: runningBalance });
    }
    return ledger;
}
