import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createPlan, getPlans, getPlanById, updatePlan, deletePlan, getPlansForPublic } from './plans.service.js';
export const createPlanHandler = catchAsync(async (request, reply) => {
    const row = await createPlan({ ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Plan created successfully', data: row });
});
export const getPlansHandler = catchAsync(async (request, reply) => {
    const rows = await getPlans();
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getPlansForPublicHandler = catchAsync(async (request, reply) => {
    const rows = await getPlansForPublic();
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getPlanByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getPlanById({ id });
    if (!row)
        throw new AppError('No Plan record found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updatePlanHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await updatePlan({ id }, { ...request.body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Plan updated successfully', data: row });
});
export const deletePlanHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deletePlan({ id });
    return reply.code(200).send({ status: true, message: 'Plan deleted successfully', data: null });
});
