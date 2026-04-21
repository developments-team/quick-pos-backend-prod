import { getUserTypesHandler, getPortalsHandler, getBusinessTypesHandler, getSupportTypesHandler, getReportLevelsHandler, getAccountTypesHandler, getAccountGroupsHandler, getTransactionStatussHandler, getVendorTypesHandler, getSexsHandler, getProgressStagesHandler, getActionsHandler, } from './constants.controller.js';
export default async function chartOfAccountRoutes(server) {
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Constants'] };
    });
    server.get('/businessTypes', getBusinessTypesHandler);
    server.register(async function protectedRoutes(srv) {
        srv.addHook('onRequest', srv.authenticate);
        srv.get('/actions', getActionsHandler);
        srv.get('/userTypes', getUserTypesHandler);
        srv.get('/portals', getPortalsHandler);
        srv.get('/supportTypes', getSupportTypesHandler);
        srv.get('/reportLevels', getReportLevelsHandler);
        srv.get('/accountTypes', getAccountTypesHandler);
        srv.get('/accountGroups', getAccountGroupsHandler);
        srv.get('/transactionStatuses', getTransactionStatussHandler);
        srv.get('/vendorTypes', getVendorTypesHandler);
        srv.get('/sexes', getSexsHandler);
        srv.get('/progressStages', getProgressStagesHandler);
    });
}
