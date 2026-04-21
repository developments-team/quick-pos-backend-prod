import { TransactionStatus } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
import incrementLastRef from '../../utils/genRef.js';
export async function openCashRegister(prisma, amount, userId) {
    return await prisma.$transaction(async (tx) => {
        const defaultAccounts = await tx.defaultAccount.findMany().then((accounts) => {
            const map = new Map();
            accounts.forEach((acc) => map.set(acc.name, acc));
            return map;
        });
        const cashAccountId = defaultAccounts.get('cash-on-hand')?.accountId;
        if (!cashAccountId)
            throw new AppError('Cash account ID is missing in defaultAccounts', 400);
        await tx.chartOfAccount.update({
            where: { id: cashAccountId },
            data: {
                openingBalance: amount,
                balanceDate: new Date(),
                description: 'Open cash register',
                updatedById: userId,
                updatedAt: new Date(),
            },
        });
        const lines = [
            { accountId: cashAccountId, debit: amount, credit: 0.0 },
            { accountId: defaultAccounts.get('owners-capital')?.accountId, debit: 0.0, credit: amount },
        ];
        const lastItem = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'OPB' } },
            orderBy: { ref: 'desc' },
        });
        const newRef = incrementLastRef('OPB', lastItem?.ref || null);
        const records = [];
        for (const line of lines) {
            const rec = await tx.transaction.create({
                data: {
                    ref: newRef,
                    tranType: 'Opening',
                    accountId: line.accountId,
                    debit: line.debit,
                    credit: line.credit,
                    status: TransactionStatus.POSTED,
                    description: 'Open cash register',
                    createdById: userId,
                },
            });
            records.push(rec);
        }
        return records;
    });
}
export async function getCashRegisterStatus(prisma) {
    const defaultAccounts = await prisma.defaultAccount.findMany().then((accounts) => {
        const map = new Map();
        accounts.forEach((acc) => map.set(acc.name, acc));
        return map;
    });
    const cashAcc = defaultAccounts.get('owners-capital');
    if (!cashAcc)
        throw new AppError('No ChartOfAccount found with that ID', 404);
    if (cashAcc.openingBalance && cashAcc.openingBalance > 0) {
        return cashAcc;
    }
    else {
        throw new AppError('No cash register found', 404);
    }
}
