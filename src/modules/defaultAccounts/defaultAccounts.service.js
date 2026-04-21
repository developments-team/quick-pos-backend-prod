import AppError from '../../utils/appError.js';
export async function saveDefaultAccounts(prisma, data, userId) {
    for (const item of data.data) {
        if (!item.accountId) {
            throw new AppError(`Account ID is required for item with ${item.name ?? item.id}`, 400);
        }
        const existingAccount = await prisma.defaultAccount.findFirst({ where: { name: item.name } });
        if (existingAccount) {
            await prisma.defaultAccount.update({
                where: { id: existingAccount.id },
                data: {
                    name: item.name,
                    group: item.group,
                    accountId: item.accountId,
                    updatedById: userId,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await prisma.defaultAccount.create({
                data: {
                    name: item.name,
                    group: item.group,
                    accountId: item.accountId,
                    createdById: userId,
                },
            });
        }
    }
}
export async function getDefaultAccounts(prisma) {
    return await prisma.defaultAccount.findMany({
        select: {
            id: true,
            group: true,
            name: true,
            accountId: true,
            account: { select: { accountNumber: true, accountName: true } },
        },
    });
}
export async function getDefaultAccountById(prisma, { id }) {
    return await prisma.defaultAccount.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            accountId: true,
            account: { select: { accountNumber: true, accountName: true } },
        },
    });
}
export async function deleteDefaultAccount(prisma, { id }) {
    return await prisma.defaultAccount.delete({ where: { id } });
}
