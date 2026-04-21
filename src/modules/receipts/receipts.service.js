import AppError from '../../utils/appError.js';
import incrementLastref from '../../utils/genRef.js';
export async function createReceipt(prisma, data) {
    return await prisma.$transaction(async (tx) => {
        const defaultAccounts = await tx.defaultAccount.findMany().then((accounts) => {
            const map = new Map();
            accounts.forEach((acc) => map.set(acc.name, acc));
            return map;
        });
        if (!defaultAccounts)
            throw new AppError('Setup account not found', 404);
        const last = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'REC' } },
            orderBy: { ref: 'desc' },
        });
        const newRef = incrementLastref('REC', last?.ref ?? null);
        await tx.transaction.create({
            data: {
                ref: newRef,
                jourId: newRef,
                tranType: 'RECEIPT',
                particularId: data.customerId,
                accountId: defaultAccounts.get('cash-on-hand')?.accountId,
                debit: data.amount,
                credit: 0,
                description: `Receipt ${newRef} - Cash received`,
                createdById: data.createdById,
            },
        });
        await tx.transaction.create({
            data: {
                ref: newRef,
                jourId: newRef,
                tranType: 'RECEIPT',
                particularId: data.customerId,
                accountId: defaultAccounts.get('accounts-payable')?.accountId,
                debit: 0,
                credit: data.amount,
                description: `Receipt ${newRef} - AR recorded`,
                createdById: data.createdById,
            },
        });
        return await tx.receipt.create({
            data: {
                ref: newRef,
                customerId: data.customerId,
                amount: data.amount,
                paymentTypeId: data.paymentTypeId,
                description: data.description,
                createdById: data.createdById,
            },
        });
    });
}
export async function getReceipts(prisma) {
    return await prisma.receipt.findMany({ include: { customer: true } });
}
export async function getReceiptById(prisma, { id }) {
    return await prisma.receipt.findUnique({ where: { id }, include: { customer: true } });
}
export async function updateReceipt(prisma, { id }, data) {
    return await prisma.receipt.update({ where: { id }, data });
}
export async function deleteReceipt(prisma, { id }) {
    return await prisma.$transaction(async (tx) => {
        const rcpt = await tx.receipt.findUnique({ where: { id } });
        if (!rcpt)
            throw new AppError('Receipt not found', 404);
        await tx.receipt.delete({ where: { id: rcpt.id } });
        await tx.transaction.deleteMany({ where: { jourId: rcpt.ref } });
        return rcpt;
    });
}
