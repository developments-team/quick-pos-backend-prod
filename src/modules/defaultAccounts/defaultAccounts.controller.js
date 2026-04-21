import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { saveDefaultAccounts, getDefaultAccounts, getDefaultAccountById, deleteDefaultAccount, } from './defaultAccounts.service.js';
export const saveDefaultAccountsHandler = catchAsync(async (request, reply) => {
    await saveDefaultAccounts(request.prisma, request.body, request.user.id);
    return reply.code(200).send({ status: true, message: 'Default accounts saved successfully' });
});
export const getDefaultAccountsHandler = catchAsync(async (request, reply) => {
    const rows = await getDefaultAccounts(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getDefaultAccountByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getDefaultAccountById(request.prisma, { id });
    if (!row)
        throw new AppError('No DefaultAccount found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const deleteDefaultAccountHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteDefaultAccount(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'DefaultAccount deleted successfully', data: null });
});
