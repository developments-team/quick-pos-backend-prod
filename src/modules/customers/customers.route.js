import { createCustomerHandler, getCustomersHandler, getCustomerByIdHandler, updateCustomerHandler, deleteCustomerHandler, } from './customers.controller.js';
import { customerBodySchema, customerParamsSchema } from './customers.schema.js';
export default async function customerRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Customers'] };
    });
    server.post('/', { schema: { body: customerBodySchema } }, createCustomerHandler);
    server.get('/', getCustomersHandler);
    server.get('/:id', { schema: { params: customerParamsSchema } }, getCustomerByIdHandler);
    server.patch('/:id', { schema: { params: customerParamsSchema, body: customerBodySchema } }, updateCustomerHandler);
    server.delete('/:id', { schema: { params: customerParamsSchema } }, deleteCustomerHandler);
}
