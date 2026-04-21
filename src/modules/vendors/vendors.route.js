import { createVendorHandler, getVendorsHandler, getVendorByIdHandler, updateVendorHandler, deleteVendorHandler, getVendorsByTypeHandler, getVendorStatementSummaryHandler, } from './vendors.controller.js';
import { vendorBodySchema, vendorParamsSchema, vendorStatementQuerySchema, vendorTypeQuerySchema, } from './vendors.schema.js';
export default async function vendorRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Vendors'] };
    });
    server.get('/byType', { schema: { querystring: vendorTypeQuerySchema } }, getVendorsByTypeHandler);
    server.post('/', { schema: { body: vendorBodySchema } }, createVendorHandler);
    server.get('/', getVendorsHandler);
    server.get('/:id', { schema: { params: vendorParamsSchema } }, getVendorByIdHandler);
    server.patch('/:id', { schema: { params: vendorParamsSchema, body: vendorBodySchema } }, updateVendorHandler);
    server.delete('/:id', { schema: { params: vendorParamsSchema } }, deleteVendorHandler);
    server.get('/:id/statement', { schema: { params: vendorParamsSchema, querystring: vendorStatementQuerySchema } }, getVendorStatementSummaryHandler);
}
