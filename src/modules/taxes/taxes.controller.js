import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createTax, getTaxes, getTaxById, updateTax, deleteTax } from './taxes.service.js';
export const createTaxHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createTax(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Tax created successfully', data: row });
});
export const getTaxesHandler = catchAsync(async (request, reply) => {
    const rows = await getTaxes(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getTaxByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getTaxById(request.prisma, { id });
    if (!row)
        throw new AppError('No Tax found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateTaxHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateTax(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Tax updated successfully', data: row });
});
export const deleteTaxHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteTax(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Tax deleted successfully', data: null });
});
