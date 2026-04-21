import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './users.service.js';
import { globalPrisma } from '../../lib/prisma.js';
export const createUserHandler = catchAsync(async (request, reply) => {
    const row = await createUser(globalPrisma, {
        ...request.body,
        createdById: request.user.id,
        tenantId: request.tenantId,
    });
    return reply.code(201).send({ status: true, message: 'User created successfully', data: row });
});
export const getUsersHandler = catchAsync(async (request, reply) => {
    const rows = await getUsers(globalPrisma, request.tenantId, request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getUserByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getUserById(globalPrisma, { id });
    if (!row)
        throw new AppError('No User found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateUserHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await updateUser(globalPrisma, { id }, { ...request.body, updatedById: request.user.id, updatedAt: new Date(), tenantId: request.tenantId });
    return reply.code(200).send({ status: true, message: 'User updated successfully', data: row });
});
export const deleteUserHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteUser(globalPrisma, { id });
    return reply.code(200).send({ status: true, message: 'User deleted successfully', data: null });
});
