import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createCostType, getCostTypes, getCostTypeById, updateCostType, deleteCostType } from './costTypes.service.js';
export const createCostTypeHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createCostType(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Cost type created successfully', data: row });
});
export const getCostTypesHandler = catchAsync(async (request, reply) => {
    const rows = await getCostTypes(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getCostTypeByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getCostTypeById(request.prisma, { id });
    if (!row)
        throw new AppError('No CostType found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateCostTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateCostType(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Cost type updated successfully', data: row });
});
export const deleteCostTypeHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteCostType(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Cost type deleted successfully', data: null });
});
