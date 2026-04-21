import { getSalesReportHandler, getSalesDetailsReportHandler, getSalesSummaryReportHandler, getSalesSummaryPerCustomerHandler, getSalesSummaryPerBranchHandler, } from './salesReports.controller.js';
import { salesReportQuerySchema } from './salesReports.schema.js';
export default async function salesReportRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Sales Reports'] };
    });
    server.get('/', { schema: { querystring: salesReportQuerySchema } }, getSalesReportHandler);
    server.get('/details', { schema: { querystring: salesReportQuerySchema } }, getSalesDetailsReportHandler);
    server.get('/summary', { schema: { querystring: salesReportQuerySchema } }, getSalesSummaryReportHandler);
    server.get('/by-customer', { schema: { querystring: salesReportQuerySchema } }, getSalesSummaryPerCustomerHandler);
    server.get('/by-branch', { schema: { querystring: salesReportQuerySchema } }, getSalesSummaryPerBranchHandler);
}
