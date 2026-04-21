import { getPurchaseReturnsHandler, getPurchaseReturnByIdHandler, createPurchaseReturnHandler, updatePurchaseReturnHandler, deletePurchaseReturnHandler, } from './purchaseReturns.controller.js';
import { purchaseReturnBodySchema, purchaseReturnParamsSchema, purchaseReturnQuerySchema, } from './purchaseReturns.schema.js';
export default async function purchaseReturnRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Purchase Returns'] };
    });
    server.post('/', { schema: { body: purchaseReturnBodySchema } }, createPurchaseReturnHandler);
    server.get('/', { schema: { querystring: purchaseReturnQuerySchema } }, getPurchaseReturnsHandler);
    server.get('/:id', { schema: { params: purchaseReturnParamsSchema } }, getPurchaseReturnByIdHandler);
    server.patch('/:id', { schema: { params: purchaseReturnParamsSchema, body: purchaseReturnBodySchema } }, updatePurchaseReturnHandler);
    server.delete('/:id', { schema: { params: purchaseReturnParamsSchema } }, deletePurchaseReturnHandler);
}
