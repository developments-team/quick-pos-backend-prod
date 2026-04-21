import catchAsync from '../../utils/catchAsync.js';
import { getAccountsByParent, getChartOfAccounts, getNewAccountNumber, createChartOfAccount, updateChartOfAccount, deleteChartOfAccount, getAccountsByGroup, } from './chartOfAccounts.service.js';
export const getAccountsByParentHandler = catchAsync(async (request, reply) => {
    const rows = await getAccountsByParent(request.prisma, request.query);
    return reply.code(200).send({ status: true, results: rows.length, data: rows });
});
export const getChartOfAccountsHandler = catchAsync(async (request, reply) => {
    const rows = await getChartOfAccounts(request.prisma, request.query);
    return reply.code(200).send({ status: true, results: rows.length, data: rows });
});
export const getNewAccountNumberHandler = catchAsync(async (request, reply) => {
    const { parentAccountId } = request.query;
    const nextNumber = await getNewAccountNumber(request.prisma, parentAccountId);
    return reply.code(200).send({
        status: true,
        message: `Next account number is ${nextNumber}`,
        data: { nextAccountNumber: nextNumber },
    });
});
export const createChartOfAccountHandler = catchAsync(async (request, reply) => {
    const created = await createChartOfAccount(request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'ChartOfAccount saved successfully', data: created });
});
export const updateChartOfAccountHandler = catchAsync(async (request, reply) => {
    const updated = await updateChartOfAccount(request.prisma, request.params, {
        ...request.body,
        updatedById: request.user.id,
    });
    return reply.code(200).send({ status: true, message: 'ChartOfAccount updated successfully', data: updated });
});
export const deleteChartOfAccountHandler = catchAsync(async (request, reply) => {
    await deleteChartOfAccount(request.prisma, request.params);
    return reply.code(204).send({ status: true, data: null });
});
export const getAccountsByGroupHandler = catchAsync(async (request, reply) => {
    const accounts = await getAccountsByGroup(request.prisma, request.params);
    return reply.code(200).send({ status: true, results: accounts.length, data: accounts });
});
