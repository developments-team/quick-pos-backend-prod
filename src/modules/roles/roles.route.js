import { getMenuRolePermissionsHandler, createRoleHandler, getRolesHandler, getRoleByIdHandler, updateRoleHandler, deleteRoleHandler, getRolesPlanHandler, } from './roles.controller.js';
import { roleBodySchema, roleParamsSchema, menuRolePermissionsParamsSchema, tenantQuerySchema, } from './roles.schema.js';
export default async function roleRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Roles'] };
    });
    server.post('/', { schema: { body: roleBodySchema } }, createRoleHandler);
    server.get('/', { schema: { querystring: tenantQuerySchema } }, getRolesHandler);
    server.get('/:id', { schema: { params: roleParamsSchema } }, getRoleByIdHandler);
    server.patch('/:id', { schema: { params: roleParamsSchema, body: roleBodySchema } }, updateRoleHandler);
    server.delete('/:id', { schema: { params: roleParamsSchema } }, deleteRoleHandler);
    server.get('/menuRolePermissions', { schema: { querystring: menuRolePermissionsParamsSchema } }, getMenuRolePermissionsHandler);
    server.get('/rolesPlan', getRolesPlanHandler);
}
