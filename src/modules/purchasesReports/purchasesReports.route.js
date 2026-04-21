import { getPurchasesDetailsPerVendorHandler, getPurchasesSummaryPerVendorHandler, } from './purchasesReports.controller.js';
import { purchasesReportQuerySchema, purchasesReportParamsSchema } from './purchasesReports.schema.js';
export default async function purchasesReportRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Purchases Reports'] };
    });
    server.get('/vendor/:id/details', { schema: { params: purchasesReportParamsSchema, querystring: purchasesReportQuerySchema } }, getPurchasesDetailsPerVendorHandler);
    server.get('/vendor/:id/summary', { schema: { params: purchasesReportParamsSchema, querystring: purchasesReportQuerySchema } }, getPurchasesSummaryPerVendorHandler);
}
