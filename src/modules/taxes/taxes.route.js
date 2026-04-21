import { createTaxHandler, getTaxesHandler, getTaxByIdHandler, updateTaxHandler, deleteTaxHandler, } from './taxes.controller.js';
import { taxBodySchema, taxParamsSchema } from './taxes.schema.js';
export default async function taxRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Taxes'] };
    });
    server.post('/', { schema: { body: taxBodySchema } }, createTaxHandler);
    server.get('/', getTaxesHandler);
    server.get('/:id', { schema: { params: taxParamsSchema } }, getTaxByIdHandler);
    server.patch('/:id', { schema: { params: taxParamsSchema, body: taxBodySchema } }, updateTaxHandler);
    server.delete('/:id', { schema: { params: taxParamsSchema } }, deleteTaxHandler);
}
