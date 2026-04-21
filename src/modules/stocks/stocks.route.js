import { getLowStockAlertsHandler, getOutOfStockHandler, getTopSellingHandler, getStockDetailReportHandler, } from './stocks.controller.js';
import { stockDetailQuerySchema } from './stocks.schema.js';
export default async function stockRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Stocks'] };
    });
    server.get('/lowStock', getLowStockAlertsHandler);
    server.get('/outOfStock', getOutOfStockHandler);
    server.get('/topSelling', getTopSellingHandler);
    server.get('/detail', { schema: { querystring: stockDetailQuerySchema } }, getStockDetailReportHandler);
}
