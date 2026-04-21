import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from './customers.service.js';
export const createCustomerHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createCustomer(request.prisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Customer created successfully', data: row });
});
export const getCustomersHandler = catchAsync(async (request, reply) => {
    const rows = await getCustomers(request.prisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getCustomerByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getCustomerById(request.prisma, { id });
    if (!row)
        throw new AppError('No Customer found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateCustomerHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateCustomer(request.prisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Customer updated successfully', data: row });
});
export const deleteCustomerHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteCustomer(request.prisma, { id });
    return reply.code(200).send({ status: true, message: 'Customer deleted successfully', data: null });
});
