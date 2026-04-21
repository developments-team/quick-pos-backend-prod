import catchAsync from '../../utils/catchAsync.js';
import { getSales, getSaleById, createSale, updateSale, deleteSale } from './sales.service.js';
export const getSalesHandler = catchAsync(async (request, reply) => {
    const sales = await getSales(request.prisma);
    return reply.code(200).send({ status: true, count: sales.length, data: sales });
});
export const getSaleByIdHandler = catchAsync(async (request, reply) => {
    const sale = await getSaleById(request.prisma, request.params);
    return reply.code(200).send({ status: true, data: sale });
});
export const createSaleHandler = catchAsync(async (request, reply) => {
    const sale = await createSale(request.prisma, request.prisma, { ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Sale created successfully', data: sale });
});
export const updateSaleHandler = catchAsync(async (request, reply) => {
    const sale = await updateSale(request.prisma, request.params, { ...request.body, updatedById: request.user.id });
    return reply.code(200).send({ status: true, message: 'Sale updated successfully', data: sale });
});
export const deleteSaleHandler = catchAsync(async (request, reply) => {
    await deleteSale(request.prisma, request.params);
    return reply.code(200).send({ status: true, message: 'Sale deleted', data: null });
});
