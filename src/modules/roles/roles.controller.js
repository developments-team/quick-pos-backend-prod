import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import { createRole, getRoles, getRoleById, updateRole, deleteRole, getMenuRolePermissions, getRolesPlan, } from './roles.service.js';
import { globalPrisma } from '../../lib/prisma.js';
export const getMenuRolePermissionsHandler = catchAsync(async (request, reply) => {
    const { portal, roleId } = request.query;
    const permissions = await getMenuRolePermissions(globalPrisma, portal, roleId);
    return reply.code(200).send({ status: true, data: permissions });
});
export const createRoleHandler = catchAsync(async (request, reply) => {
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await createRole(globalPrisma, { ...body, createdById: request.user.id });
    return reply.code(201).send({ status: true, message: 'Role created successfully', data: row });
});
export const getRolesHandler = catchAsync(async (request, reply) => {
    const { tenantId, portal } = request.query;
    const rows = await getRoles(globalPrisma, tenantId, portal);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
export const getRoleByIdHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const row = await getRoleById(globalPrisma, { id });
    if (!row)
        throw new AppError('No Role found with that ID', 404);
    return reply.code(200).send({ status: true, data: row });
});
export const updateRoleHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    const body = request.body;
    if (!body)
        throw new AppError('Request body is required', 400);
    const row = await updateRole(globalPrisma, { id }, { ...body, updatedById: request.user.id, updatedAt: new Date() });
    return reply.code(200).send({ status: true, message: 'Role updated successfully', data: row });
});
export const deleteRoleHandler = catchAsync(async (request, reply) => {
    const { id } = request.params;
    await deleteRole(globalPrisma, { id });
    return reply.code(200).send({ status: true, message: 'Role deleted successfully', data: null });
});
export const getRolesPlanHandler = catchAsync(async (request, reply) => {
    const rows = await getRolesPlan(globalPrisma);
    return reply.code(200).send({ status: true, count: rows.length, data: rows });
});
