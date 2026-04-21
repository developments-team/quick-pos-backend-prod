import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createCustomerGroup, getCustomerGroups, getCustomerGroupById, updateCustomerGroup, deleteCustomerGroup, } from './customerGroups.service.js';
export const createCustomerGroupHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createCustomerGroup(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'CustomerGroup created successfully', data: row });
});
export const getCustomerGroupsHandler = catchAsync(async (request, reply) => {
    const rows = await getCustomerGroups(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getCustomerGroupByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getCustomerGroupById(request.prisma, { id });
    if (!row)
        throw new AppError('No CustomerGroup found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateCustomerGroupHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateCustomerGroup(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'CustomerGroup updated successfully', data: row });
});
export const deleteCustomerGroupHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteCustomerGroup(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'CustomerGroup deleted successfully', data: null });
});
