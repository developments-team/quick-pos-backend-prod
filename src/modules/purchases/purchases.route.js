import { getPurchasesHandler, getPurchaseByIdHandler, createPurchaseHandler, updatePurchaseHandler, deletePurchaseHandler, } from './purchases.controller.js';
import { purchaseBodySchema, purchaseParamsSchema } from './purchases.schema.js';
export default async function purchaseRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Purchases'] };
    });
    server.post('/', { schema: { body: purchaseBodySchema } }, createPurchaseHandler);
    server.get('/', getPurchasesHandler);
    server.get('/:id', { schema: { params: purchaseParamsSchema } }, getPurchaseByIdHandler);
    server.patch('/:id', { schema: { params: purchaseParamsSchema, body: purchaseBodySchema } }, updatePurchaseHandler);
    server.delete('/:id', { schema: { params: purchaseParamsSchema } }, deletePurchaseHandler);
}
