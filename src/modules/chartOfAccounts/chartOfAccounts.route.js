import { getAccountsByParentHandler, getChartOfAccountsHandler, getNewAccountNumberHandler, createChartOfAccountHandler, updateChartOfAccountHandler, deleteChartOfAccountHandler, getAccountsByGroupHandler, } from './chartOfAccounts.controller.js';
import { chartOfAccountBodySchema, chartOfAccountParamsSchema, chartOfAccountGroupParamsSchema, chartOfAccountQuerySchema, } from './chartOfAccounts.schema.js';
export default async function chartOfAccountRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['ChartOfAccounts'] };
    });
    server.get('/byParent', { schema: { querystring: chartOfAccountQuerySchema } }, getAccountsByParentHandler);
    server.get('/nextNumber', { schema: { querystring: chartOfAccountQuerySchema } }, getNewAccountNumberHandler);
    server.get('/byGroup/:accountGroup', { schema: { params: chartOfAccountGroupParamsSchema } }, getAccountsByGroupHandler);
    server.post('/', { schema: { body: chartOfAccountBodySchema } }, createChartOfAccountHandler);
    server.get('/', { schema: { querystring: chartOfAccountQuerySchema } }, getChartOfAccountsHandler);
    server.patch('/:id', { schema: { params: chartOfAccountParamsSchema, body: chartOfAccountBodySchema } }, updateChartOfAccountHandler);
    server.delete('/:id', { schema: { params: chartOfAccountParamsSchema } }, deleteChartOfAccountHandler);
}
