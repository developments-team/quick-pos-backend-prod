import { getRolePermissionHandler, upsertPermissionHandler, getAllRolePermissionsHandler, deleteAllRolePermissionsHandler, } from './rolePermissions.controller.js';
import { rolePermissionBodySchema, rolePermissionParamsSchema, rolePermissionQuerySchema, } from './rolePermissions.schema.js';
export default async function rolePermissionRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['RolePermissions'] };
    });
    server.get('/', { schema: { querystring: rolePermissionQuerySchema } }, getRolePermissionHandler);
    server.get('/all', getAllRolePermissionsHandler);
    server.put('/:roleId', { schema: { params: rolePermissionParamsSchema, body: rolePermissionBodySchema } }, upsertPermissionHandler);
    server.delete('/all', deleteAllRolePermissionsHandler);
}
