import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createProfile, getProfileById, updateProfile } from './profiles.service.js';
import { globalPrisma } from '../../lib/prisma.js';
export const setupProfileHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createProfile(globalPrisma, { ...body, userId: request.user.id });
    return reply.code(201).send({ status: true, message: 'Profile saved successfully', data: row });
});
export const getProfileByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getProfileById(globalPrisma, { id });
    if (!row)
        throw new AppError('No Profile found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateProfileHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateProfile(globalPrisma, { id }, { ...body, userId: request.user.id });
    return reply.code(200).send({ status: true, message: 'Profile updated successfully', data: row });
});
