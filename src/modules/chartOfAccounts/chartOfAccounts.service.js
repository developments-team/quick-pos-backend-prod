import { AccountType } from '../../generated/prisma/client.js';
import AppError from '../../utils/appError.js';
export async function getAccountsByParent(prisma, query) {
    const { parentAccountId } = query;
    if (!parentAccountId)
        throw new AppError('Parent account query parameter is required', 400);
    const where = parentAccountId === '0' ? { accountLevel: 0 } : { parentAccountId };
    const parentAccount = parentAccountId !== '0' ? await prisma.chartOfAccount.findUnique({ where: { id: parentAccountId } }) : null;
    const accounts = await prisma.chartOfAccount.findMany({
        where,
        include: { parentAccount: { select: { id: true, accountName: true, accountNumber: true, openingBalance: true } } },
    });
    const rows = (parentAccount ? [parentAccount, ...accounts] : accounts).map((a) => ({
        ...a,
        isParent: a.id === parentAccountId,
    }));
    if (!rows || rows.length === 0)
        throw new AppError(`No accounts found for parent account ${parentAccountId}`, 404);
    return rows;
}
export async function getChartOfAccounts(prisma, query) {
    const { parentAccountId } = query;
    const where = parentAccountId ? { parentAccountId } : { accountLevel: 1 };
    const rows = await prisma.chartOfAccount.findMany({
        where,
        include: { parentAccount: { select: { id: true, accountName: true, accountNumber: true, openingBalance: true } } },
    });
    if (!rows || rows.length === 0)
        throw new AppError(`No accounts found for parent account ${parentAccountId}`, 404);
    return rows;
}
export async function getNewAccountNumber(prisma, parentAccountId) {
    if (!parentAccountId)
        throw new AppError('Parent account ID is required', 400);
    const parent = await prisma.chartOfAccount.findUnique({ where: { id: parentAccountId } });
    if (!parent)
        throw new AppError('Parent account not found', 404);
    const last = await prisma.chartOfAccount.findFirst({
        where: { accountGroup: parent.accountGroup, parentAccountId: parent.id },
        orderBy: { accountNumber: 'desc' },
        select: { accountNumber: true },
    });
    return last ? (Number(last.accountNumber) + 1).toString() : (Number(parent.accountNumber) + 1).toString();
}
export async function createChartOfAccount(prisma, data) {
    const parent = await prisma.chartOfAccount.findUnique({ where: { id: data.parentAccountId } });
    if (!parent)
        throw new AppError('Parent account not found', 404);
    const parentNum = parent.accountNumber.toString()[0];
    if (!data.accountNumber.toString().startsWith(parentNum)) {
        throw new AppError(`Account number must start with parent's account number: ${parentNum}`, 400);
    }
    const exists = await prisma.chartOfAccount.findUnique({ where: { accountNumber: data.accountNumber } });
    if (exists)
        throw new AppError(`Account number: ${data.accountNumber} already exists`, 400);
    return await prisma.chartOfAccount.create({
        data: {
            parentAccountId: data.parentAccountId,
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            accountGroup: parent.accountGroup,
            accountType: data.accountType,
            accountLevel: parent.accountLevel + 1,
            openingBalance: data.openingBalance,
            balanceDate: data.balanceDate ? new Date(data.balanceDate) : undefined,
            description: data.description,
            createdById: data.createdById,
        },
    });
}
export async function updateChartOfAccount(prisma, { id }, data) {
    const account = await prisma.chartOfAccount.findUnique({ where: { id } });
    if (!account)
        throw new AppError('No account found with that ID', 404);
    const parent = await prisma.chartOfAccount.findUnique({ where: { id: data.parentAccountId } });
    if (!parent)
        throw new AppError('Parent account not found', 404);
    const parentNum = parent.accountNumber.toString()[0];
    if (!data.accountNumber.toString().startsWith(parentNum)) {
        throw new AppError(`Account number must start with parent's account number: ${parentNum}`, 400);
    }
    const duplicate = await prisma.chartOfAccount.findFirst({
        where: { accountNumber: data.accountNumber, id: { not: id } },
    });
    if (duplicate)
        throw new AppError(`Account number: ${data.accountNumber} already exists`, 400);
    return await prisma.chartOfAccount.update({
        where: { id },
        data: {
            parentAccountId: data.parentAccountId,
            accountNumber: data.accountNumber,
            accountName: data.accountName,
            accountGroup: parent.accountGroup,
            accountType: data.accountType,
            accountLevel: parent.accountLevel + 1,
            openingBalance: data.openingBalance,
            balanceDate: data.balanceDate ? new Date(data.balanceDate) : undefined,
            description: data.description,
            updatedById: data.updatedById,
            updatedAt: new Date(),
        },
    });
}
export async function deleteChartOfAccount(prisma, { id }) {
    return await prisma.chartOfAccount.delete({ where: { id } });
}
export async function getAccountsByGroup(prisma, { accountGroup }) {
    const accounts = await prisma.chartOfAccount.findMany({
        where: { accountGroup: accountGroup, accountType: AccountType.DETAIL },
        select: { id: true, accountNumber: true, accountName: true },
    });
    if (!accounts || accounts.length === 0)
        throw new AppError(`No accounts found for account group ${accountGroup}`, 404);
    return accounts;
}
