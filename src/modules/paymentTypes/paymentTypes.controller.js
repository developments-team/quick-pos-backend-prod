import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createPaymentType, getPaymentTypes, getPaymentTypeById, updatePaymentType, deletePaymentType, } from './paymentTypes.service.js';
export const createPaymentTypeHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createPaymentType(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Payment type created successfully', data: row });
});
export const getPaymentTypesHandler = catchAsync(async (request, reply) => {
    const rows = await getPaymentTypes(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getPaymentTypeByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getPaymentTypeById(request.prisma, { id });
    if (!row)
        throw new AppError('No PaymentType found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updatePaymentTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updatePaymentType(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Payment type updated successfully', data: row });
});
export const deletePaymentTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deletePaymentType(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Payment type deleted successfully', data: null });
});
