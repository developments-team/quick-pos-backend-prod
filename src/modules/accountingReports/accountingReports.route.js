import { getTrialBalanceHandler, getBalanceSheetHandler, getIncomeStatementHandler, getOwnersEquityHandler, getGeneralLedgerHandler, } from './accountingReports.controller.js';
import { asOfDateQuerySchema, dateRangeQuerySchema, generalLedgerQuerySchema } from './accountingReports.schema.js';
export default async function accountingReportRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Accounting Reports'] };
    });
    server.get('/trial-balance', { schema: { querystring: asOfDateQuerySchema } }, getTrialBalanceHandler);
    server.get('/balance-sheet', { schema: { querystring: asOfDateQuerySchema } }, getBalanceSheetHandler);
    server.get('/income-statement', { schema: { querystring: dateRangeQuerySchema } }, getIncomeStatementHandler);
    server.get('/owners-equity', { schema: { querystring: dateRangeQuerySchema } }, getOwnersEquityHandler);
    server.get('/general-ledger', { schema: { querystring: generalLedgerQuerySchema } }, getGeneralLedgerHandler);
}
