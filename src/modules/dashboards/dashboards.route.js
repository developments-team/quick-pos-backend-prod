import { getDashboardSummaryHandler, getSalesTrendsHandler, getCustomerInsightsHandler, getSalesByUserHandler, getTopProductsHandler, getOutOfStockProductsHandler, getInventoryStatusHandler, } from './dashboards.controller.js';
import { salesTrendsQuerySchema } from './dashboards.schema.js';
export default async function dashboardRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Dashboard'] };
    });
    server.get('/summary', getDashboardSummaryHandler);
    server.get('/sales-trends', { schema: { querystring: salesTrendsQuerySchema } }, getSalesTrendsHandler);
    server.get('/top-customers', getCustomerInsightsHandler);
    server.get('/sales-by-user', getSalesByUserHandler);
    server.get('/top-products', getTopProductsHandler);
    server.get('/out-of-stock', getOutOfStockProductsHandler);
    server.get('/inventory-status', getInventoryStatusHandler);
}
