import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createBranch, getBranches, getBranchById, updateBranch, deleteBranch } from './branches.service.js';
export const createBranchHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    console.log(request.user.id);
    const row = await createBranch(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Branch created successfully', data: row });
});
export const getBranchesHandler = catchAsync(async (request, reply) => {
    const rows = await getBranches(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getBranchByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getBranchById(request.prisma, { id });
    if (!row)
        throw new AppError('No Branch found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateBranchHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateBranch(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Branch updated successfully', data: row });
});
export const deleteBranchHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteBranch(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Branch deleted successfully', data: null });
});
