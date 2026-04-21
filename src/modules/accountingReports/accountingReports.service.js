import { AccountGroup, AccountType, TransactionStatus } from '../../generated/prisma/client.js';
const normalBalanceIsDebit = {
    [AccountGroup.ASSET]: true,
    [AccountGroup.LIABILITY]: false,
    [AccountGroup.EQUITY]: false,
    [AccountGroup.REVENUE]: false,
    [AccountGroup.EXPENSE]: true,
};
async function getAccountBalance(prisma, accountId, accountGroup, openingBalance, asOfDate) {
    const result = await prisma.transaction.aggregate({
        where: {
            accountId,
            jourDate: { lte: asOfDate },
            status: TransactionStatus.POSTED,
        },
        _sum: { debit: true, credit: true },
    });
    const totalDebit = result._sum.debit || 0;
    const totalCredit = result._sum.credit || 0;
    let balance;
    if (normalBalanceIsDebit[accountGroup]) {
        balance = openingBalance + totalDebit - totalCredit;
    }
    else {
        balance = openingBalance + totalCredit - totalDebit;
    }
    return { balance, totalDebit, totalCredit };
}
export async function getTrialBalance(prisma, query) {
    const { asOfDate } = query;
    const endDate = new Date(asOfDate);
    endDate.setHours(23, 59, 59, 999);
    const accounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL },
        orderBy: [{ accountGroup: 'asc' }, { accountNumber: 'asc' }],
    });
    const trialBalanceData = [];
    let totalDebits = 0;
    let totalCredits = 0;
    for (const account of accounts) {
        const { balance, totalDebit, totalCredit } = await getAccountBalance(prisma, account.id, account.accountGroup, account.openingBalance, endDate);
        if (balance !== 0 || totalDebit !== 0 || totalCredit !== 0) {
            let finalDebit = 0, finalCredit = 0;
            if (balance > 0) {
                if (normalBalanceIsDebit[account.accountGroup])
                    finalDebit = balance;
                else
                    finalCredit = balance;
            }
            else if (balance < 0) {
                if (normalBalanceIsDebit[account.accountGroup])
                    finalCredit = Math.abs(balance);
                else
                    finalDebit = Math.abs(balance);
            }
            if (finalDebit !== 0 || finalCredit !== 0) {
                trialBalanceData.push({
                    accountId: account.id,
                    accountNumber: account.accountNumber,
                    accountName: account.accountName,
                    accountGroup: account.accountGroup,
                    debit: finalDebit,
                    credit: finalCredit,
                });
                totalDebits += finalDebit;
                totalCredits += finalCredit;
            }
        }
    }
    const groupedData = Object.values(AccountGroup).reduce((acc, group) => {
        acc[group] = trialBalanceData.filter((a) => a.accountGroup === group);
        return acc;
    }, {});
    return {
        asOfDate,
        accounts: groupedData,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
}
export async function getBalanceSheet(prisma, query) {
    const { asOfDate } = query;
    const endDate = new Date(asOfDate);
    endDate.setHours(23, 59, 59, 999);
    const accounts = await prisma.chartOfAccount.findMany({
        where: {
            accountType: AccountType.DETAIL,
            accountGroup: { in: [AccountGroup.ASSET, AccountGroup.LIABILITY, AccountGroup.EQUITY] },
        },
        orderBy: [{ accountGroup: 'asc' }, { accountNumber: 'asc' }],
    });
    const revenueAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.REVENUE },
    });
    const expenseAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.EXPENSE },
    });
    let totalRevenue = 0;
    for (const acc of revenueAccounts) {
        const { balance } = await getAccountBalance(prisma, acc.id, acc.accountGroup, acc.openingBalance, endDate);
        totalRevenue += balance;
    }
    let totalExpenses = 0;
    for (const acc of expenseAccounts) {
        const { balance } = await getAccountBalance(prisma, acc.id, acc.accountGroup, acc.openingBalance, endDate);
        totalExpenses += balance;
    }
    const netIncome = totalRevenue - totalExpenses;
    const assets = [];
    const liabilities = [];
    const equity = [];
    let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
    for (const account of accounts) {
        const { balance } = await getAccountBalance(prisma, account.id, account.accountGroup, account.openingBalance, endDate);
        if (balance !== 0) {
            const item = {
                accountNumber: account.accountNumber,
                accountName: account.accountName,
                balance: Math.abs(balance),
            };
            switch (account.accountGroup) {
                case AccountGroup.ASSET:
                    assets.push(item);
                    totalAssets += balance;
                    break;
                case AccountGroup.LIABILITY:
                    liabilities.push(item);
                    totalLiabilities += balance;
                    break;
                case AccountGroup.EQUITY:
                    equity.push(item);
                    totalEquity += balance;
                    break;
            }
        }
    }
    if (netIncome !== 0) {
        equity.push({ accountNumber: '', accountName: 'Net Income (Current Period)', balance: netIncome });
        totalEquity += netIncome;
    }
    return {
        asOfDate,
        assets: { items: assets, total: totalAssets },
        liabilities: { items: liabilities, total: totalLiabilities },
        equity: { items: equity, total: totalEquity },
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
}
export async function getIncomeStatement(prisma, query) {
    const { startDate, endDate: endDateStr } = query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const revenueAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.REVENUE },
        orderBy: { accountNumber: 'asc' },
    });
    const expenseAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.EXPENSE },
        orderBy: { accountNumber: 'asc' },
    });
    const revenues = [];
    const expenses = [];
    let totalRevenue = 0, totalExpenses = 0;
    for (const acc of revenueAccounts) {
        const result = await prisma.transaction.aggregate({
            where: { accountId: acc.id, jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED },
            _sum: { debit: true, credit: true },
        });
        const amount = (result._sum.credit || 0) - (result._sum.debit || 0);
        if (amount !== 0) {
            revenues.push({ accountNumber: acc.accountNumber, accountName: acc.accountName, amount });
            totalRevenue += amount;
        }
    }
    for (const acc of expenseAccounts) {
        const result = await prisma.transaction.aggregate({
            where: { accountId: acc.id, jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED },
            _sum: { debit: true, credit: true },
        });
        const amount = (result._sum.debit || 0) - (result._sum.credit || 0);
        if (amount !== 0) {
            expenses.push({ accountNumber: acc.accountNumber, accountName: acc.accountName, amount });
            totalExpenses += amount;
        }
    }
    return {
        startDate,
        endDate: endDateStr,
        revenues: { items: revenues, total: totalRevenue },
        expenses: { items: expenses, total: totalExpenses },
        netIncome: totalRevenue - totalExpenses,
    };
}
export async function getOwnersEquity(prisma, query) {
    const { startDate, endDate: endDateStr } = query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const beforeStart = new Date(start);
    beforeStart.setDate(beforeStart.getDate() - 1);
    beforeStart.setHours(23, 59, 59, 999);
    const equityAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.EQUITY },
    });
    const revenueAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.REVENUE },
    });
    const expenseAccounts = await prisma.chartOfAccount.findMany({
        where: { accountType: AccountType.DETAIL, accountGroup: AccountGroup.EXPENSE },
    });
    let beginningEquity = 0;
    for (const acc of equityAccounts) {
        const { balance } = await getAccountBalance(prisma, acc.id, acc.accountGroup, acc.openingBalance, beforeStart);
        beginningEquity += balance;
    }
    let priorRevenue = 0, priorExpenses = 0;
    for (const acc of revenueAccounts) {
        const { balance } = await getAccountBalance(prisma, acc.id, acc.accountGroup, acc.openingBalance, beforeStart);
        priorRevenue += balance;
    }
    for (const acc of expenseAccounts) {
        const { balance } = await getAccountBalance(prisma, acc.id, acc.accountGroup, acc.openingBalance, beforeStart);
        priorExpenses += balance;
    }
    beginningEquity += priorRevenue - priorExpenses;
    let currentRevenue = 0, currentExpenses = 0;
    for (const acc of revenueAccounts) {
        const result = await prisma.transaction.aggregate({
            where: { accountId: acc.id, jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED },
            _sum: { debit: true, credit: true },
        });
        currentRevenue += (result._sum.credit || 0) - (result._sum.debit || 0);
    }
    for (const acc of expenseAccounts) {
        const result = await prisma.transaction.aggregate({
            where: { accountId: acc.id, jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED },
            _sum: { debit: true, credit: true },
        });
        currentExpenses += (result._sum.debit || 0) - (result._sum.credit || 0);
    }
    let additionalInvestments = 0, withdrawals = 0;
    for (const acc of equityAccounts) {
        const result = await prisma.transaction.aggregate({
            where: { accountId: acc.id, jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED },
            _sum: { debit: true, credit: true },
        });
        additionalInvestments += result._sum.credit || 0;
        withdrawals += result._sum.debit || 0;
    }
    const periodNetIncome = currentRevenue - currentExpenses;
    return {
        startDate,
        endDate: endDateStr,
        beginningEquity,
        addNetIncome: periodNetIncome,
        addInvestments: additionalInvestments,
        lessWithdrawals: withdrawals,
        endingEquity: beginningEquity + periodNetIncome + additionalInvestments - withdrawals,
    };
}
export async function getGeneralLedger(prisma, query) {
    const { startDate, endDate: endDateStr, accountId } = query;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const where = { jourDate: { gte: start, lte: end }, status: TransactionStatus.POSTED, accountId: { not: null } };
    if (accountId)
        where.accountId = accountId;
    const transactions = await prisma.transaction.findMany({
        where,
        include: {
            account: {
                select: { id: true, accountNumber: true, accountName: true, accountGroup: true, openingBalance: true },
            },
        },
        orderBy: [{ jourDate: 'asc' }, { createdAt: 'asc' }],
    });
    const beforeStart = new Date(start);
    beforeStart.setDate(beforeStart.getDate() - 1);
    beforeStart.setHours(23, 59, 59, 999);
    const ledgerByAccount = {};
    for (const txn of transactions) {
        if (!txn.account)
            continue;
        const accId = txn.account.id;
        if (!ledgerByAccount[accId]) {
            const { balance: openingBal } = await getAccountBalance(prisma, accId, txn.account.accountGroup, txn.account.openingBalance, beforeStart);
            ledgerByAccount[accId] = {
                accountId: accId,
                accountNumber: txn.account.accountNumber,
                accountName: txn.account.accountName,
                accountGroup: txn.account.accountGroup,
                openingBalance: openingBal,
                entries: [],
                closingBalance: openingBal,
            };
        }
        const ledger = ledgerByAccount[accId];
        const isDebitAccount = normalBalanceIsDebit[txn.account.accountGroup];
        const balanceChange = isDebitAccount ? txn.debit - txn.credit : txn.credit - txn.debit;
        ledger.closingBalance += balanceChange;
        ledger.entries.push({
            date: txn.jourDate,
            ref: txn.ref,
            tranType: txn.tranType,
            memo: txn.memo,
            debit: txn.debit,
            credit: txn.credit,
            runningBalance: ledger.closingBalance,
        });
    }
    return {
        startDate,
        endDate: endDateStr,
        accountId: accountId || 'All Accounts',
        accounts: Object.values(ledgerByAccount).sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
    };
}
