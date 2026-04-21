import AppError from '../../utils/appError.js';
import incrementLastref from '../../utils/genRef.js';
export async function createPayment(prisma, data) {
    return await prisma.$transaction(async (tx) => {
        const defaultAccounts = await tx.defaultAccount.findMany().then((accounts) => {
            const map = new Map();
            accounts.forEach((acc) => map.set(acc.name, acc));
            return map;
        });
        if (!defaultAccounts)
            throw new AppError('Setup account not found', 404);
        const lastTxn = await tx.transaction.findFirst({
            where: { ref: { startsWith: 'PAY' } },
            orderBy: { ref: 'desc' },
        });
        const newRef = incrementLastref('PAY', lastTxn?.ref ?? null);
        await tx.transaction.createMany({
            data: [
                {
                    ref: newRef,
                    tranType: 'PAYMENT',
                    particularId: data.vendorId,
                    accountId: defaultAccounts?.get('accounts-payable')?.accountId,
                    debit: data.amount,
                    credit: 0,
                    description: data.description,
                    createdById: data.createdById,
                },
                {
                    ref: newRef,
                    tranType: 'PAYMENT',
                    particularId: data.vendorId,
                    accountId: defaultAccounts?.get('cash-on-hand')?.accountId,
                    debit: 0,
                    credit: data.amount,
                    description: data.description,
                    createdById: data.createdById,
                },
            ],
        });
        return await tx.payment.create({
            data: {
                ref: newRef,
                vendorId: data.vendorId,
                amount: data.amount,
                paymentTypeId: data.paymentTypeId,
                description: data.description,
                createdById: data.createdById,
            },
        });
    });
}
export async function getPayments(prisma) {
    return await prisma.payment.findMany({ include: { vendor: true } });
}
export async function getPaymentById(prisma, { id }) {
    return await prisma.payment.findUnique({ where: { id }, include: { vendor: true } });
}
export async function updatePayment(prisma, { id }, data) {
    return await prisma.payment.update({
        where: { id },
        data: { ...data, updatedById: data.updatedById },
    });
}
export async function deletePayment(prisma, { id }) {
    return await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({ where: { id } });
        if (!payment)
            throw new AppError('Payment not found', 404);
        await tx.transaction.deleteMany({ where: { ref: payment.ref } });
        return await tx.payment.delete({ where: { id: payment.id } });
    });
}
