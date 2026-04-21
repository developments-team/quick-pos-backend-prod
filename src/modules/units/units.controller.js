import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createUnit, getUnits, getUnitById, updateUnit, deleteUnit } from './units.service.js';
export const createUnitHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createUnit(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Unit created successfully', data: row });
});
export const getUnitsHandler = catchAsync(async (request, reply) => {
    const rows = await getUnits(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getUnitByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getUnitById(request.prisma, { id });
    if (!row)
        throw new AppError('No Unit found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateUnitHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateUnit(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Unit updated successfully', data: row });
});
export const deleteUnitHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteUnit(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Unit deleted successfully', data: null });
});
