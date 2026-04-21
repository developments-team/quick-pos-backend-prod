import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createCurrency, getCurrencies, getCurrencyById, updateCurrency, deleteCurrency, } from './currencies.service.js';
export const createCurrencyHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createCurrency(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Currency created successfully', data: row });
});
export const getCurrenciesHandler = catchAsync(async (request, reply) => {
    const rows = await getCurrencies(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getCurrencyByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getCurrencyById(request.prisma, { id });
    if (!row)
        throw new AppError('No Currency found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateCurrencyHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateCurrency(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Currency updated successfully', data: row });
});
export const deleteCurrencyHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteCurrency(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Currency deleted successfully', data: null });
});
