import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createGroup, getGroups, getGroupById, updateGroup, deleteGroup } from './groups.service.js';
export const createGroupHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createGroup(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Group created successfully', data: row });
});
export const getGroupsHandler = catchAsync(async (request, reply) => {
    const rows = await getGroups(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getGroupByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getGroupById(request.prisma, { id });
    if (!row)
        throw new AppError('No Group found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateGroupHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateGroup(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Group updated successfully', data: row });
});
export const deleteGroupHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteGroup(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Group deleted successfully', data: null });
});
