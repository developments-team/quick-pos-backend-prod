import { createCustomerGroupHandler, getCustomerGroupsHandler, getCustomerGroupByIdHandler, updateCustomerGroupHandler, deleteCustomerGroupHandler, } from './customerGroups.controller.js';
import { customerGroupBodySchema, customerGroupParamsSchema } from './customerGroups.schema.js';
export default async function customerGroupRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['CustomerGroups'] };
    });
    server.post('/', { schema: { body: customerGroupBodySchema } }, createCustomerGroupHandler);
    server.get('/', getCustomerGroupsHandler);
    server.get('/:id', { schema: { params: customerGroupParamsSchema } }, getCustomerGroupByIdHandler);
    server.patch('/:id', { schema: { params: customerGroupParamsSchema, body: customerGroupBodySchema } }, updateCustomerGroupHandler);
    server.delete('/:id', { schema: { params: customerGroupParamsSchema } }, deleteCustomerGroupHandler);
}
