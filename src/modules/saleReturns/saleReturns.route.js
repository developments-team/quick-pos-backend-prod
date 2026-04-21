import { createSaleReturnHandler } from './saleReturns.controller.js';
import { saleReturnBodySchema } from './saleReturns.schema.js';
export default async function saleReturnRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Sale Returns'] };
    });
    server.post('/', { schema: { body: saleReturnBodySchema } }, createSaleReturnHandler);
}
