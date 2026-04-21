function formatDate(date) {
    return date.toLocaleDateString('en-GB');
}
export async function getCustomerStatementSummary(prisma, customerId, fromDate, toDate) {
    const prevSales = await prisma.sale.aggregate({
        where: {
            customerId,
            createdAt: { lt: fromDate },
            due: { gt: 0 },
        },
        _sum: { due: true },
    });
    const previousSales = prevSales._sum.due ?? 0;
    const prevReceipts = await prisma.receipt.aggregate({
        where: {
            customerId,
            receiptDate: { lt: fromDate },
        },
        _sum: { amount: true },
    });
    const previousReceipts = prevReceipts._sum.amount ?? 0;
    const previousBalance = previousSales - previousReceipts;
    const currentSales = await prisma.sale.findMany({
        where: {
            customerId,
            createdAt: { gte: fromDate, lte: toDate },
            due: { gt: 0 },
        },
        select: { createdAt: true, ref: true, due: true },
    });
    const currentReceipts = await prisma.receipt.findMany({
        where: {
            customerId,
            receiptDate: { gte: fromDate, lte: toDate },
        },
        select: { receiptDate: true, ref: true, amount: true },
    });
    const formattedSales = currentSales.map((sale) => ({
        date: sale.createdAt,
        reference: sale.ref ? `${sale.ref} (Sale)` : 'Sale',
        amount: sale.due,
    }));
    const formattedReceipts = currentReceipts.map((rcpt) => ({
        date: rcpt.receiptDate,
        reference: rcpt.ref ? `${rcpt.ref} (Receipt)` : 'Receipt',
        amount: -rcpt.amount,
    }));
    const transactions = [...formattedSales, ...formattedReceipts];
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    let runningBalance = previousBalance;
    const ledger = [];
    ledger.push({
        date: formatDate(fromDate),
        reference: 'PREV. BALANCE',
        amount: previousBalance,
        balance: previousBalance,
    });
    for (const txn of transactions) {
        if (txn.amount) {
            runningBalance += txn.amount;
            ledger.push({
                date: formatDate(txn.date),
                reference: txn.reference,
                amount: txn.amount,
                balance: runningBalance,
            });
        }
    }
    return ledger;
}
