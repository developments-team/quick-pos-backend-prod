import catchAsync from '../../utils/catchAsync.js';
import { getRolePermission, upsertPermission, getAllRolePermissions, deleteAllRolePermissions, } from './rolePermissions.service.js';
export const getRolePermissionHandler = catchAsync(async (request, reply) => {
    const result = await getRolePermission(request.prisma, request.query);
    return reply.code(200).send({ status: true, data: result });
});
export const upsertPermissionHandler = catchAsync(async (request, reply) => {
    const result = await upsertPermission(request.prisma, request.params, request.body, request.user.id);
    return reply.code(200).send({ status: true, message: 'Permissions updated', data: result });
});
export const getAllRolePermissionsHandler = catchAsync(async (request, reply) => {
    const result = await getAllRolePermissions(request.prisma);
    return reply.code(200).send({ status: true, data: result });
});
export const deleteAllRolePermissionsHandler = catchAsync(async (request, reply) => {
    await deleteAllRolePermissions(request.prisma);
    return reply.code(200).send({ status: true, message: 'All rolePermissions deleted successfully.' });
});
