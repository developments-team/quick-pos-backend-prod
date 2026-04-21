import catchAsync from '../../utils/catchAsync.js';
import { getAllTenants, getTenantById, createTenant, createTenantPublic, updateTenant, deleteTenant, } from './tenants.service.js';
export const getAllTenantsHandler = catchAsync(async (request, reply) => {
    const rows = await getAllTenants();
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getTenantHandler = catchAsync(async (request, reply) => {
    const row = await getTenantById(request.params);
    return reply.code(200).send({ status: true, data: row });
});
export const createTenantHandler = catchAsync(async (request, reply) => {
    const row = await createTenant({ ...request.body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Tenant created successfully', data: row });
});
export const createTenantPublicHandler = catchAsync(async (request, reply) => {
    const row = await createTenantPublic(request.body);
    return reply.code(201).send({ status: true, message: 'Tenant registered successfully', data: row });
});
export const updateTenantHandler = catchAsync(async (request, reply) => {
    const row = await updateTenant(request.params, { ...request.body, updatedById: request.user.id });
    return reply.code(200).send({ status: true, message: 'Tenant updated successfully', data: row });
});
export const deleteTenantHandler = catchAsync(async (request, reply) => {
    await deleteTenant(request.params);
    return reply.code(200).send({ status: true, message: 'Tenant deleted successfully', data: null });
});
