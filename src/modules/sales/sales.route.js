import { getSalesHandler, getSaleByIdHandler, createSaleHandler, updateSaleHandler, deleteSaleHandler, } from './sales.controller.js';
import { saleBodySchema, saleParamsSchema } from './sales.schema.js';
export default async function saleRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Sales'] };
    });
    server.post('/', { schema: { body: saleBodySchema } }, createSaleHandler);
    server.get('/', getSalesHandler);
    server.get('/:id', { schema: { params: saleParamsSchema } }, getSaleByIdHandler);
    server.patch('/:id', { schema: { params: saleParamsSchema, body: saleBodySchema } }, updateSaleHandler);
    server.delete('/:id', { schema: { params: saleParamsSchema } }, deleteSaleHandler);
}
