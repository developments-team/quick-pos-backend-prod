import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createAdjustmentType, getAdjustmentTypes, getAdjustmentTypeById, updateAdjustmentType, deleteAdjustmentType, } from './adjustmentTypes.service.js';
export const createAdjustmentTypeHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createAdjustmentType(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Adjustment type created successfully', data: row });
});
export const getAdjustmentTypesHandler = catchAsync(async (request, reply) => {
    const rows = await getAdjustmentTypes(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getAdjustmentTypeByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getAdjustmentTypeById(request.prisma, { id });
    if (!row)
        throw new AppError('No AdjustmentType found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateAdjustmentTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateAdjustmentType(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Adjustment type updated successfully', data: row });
});
export const deleteAdjustmentTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteAdjustmentType(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Adjustment type deleted successfully', data: null });
});
