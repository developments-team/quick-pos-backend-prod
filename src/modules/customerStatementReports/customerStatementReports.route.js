import { getStatementHandler } from './customerStatementReports.controller.js';
import { customerStatementQuerySchema } from './customerStatementReports.schema.js';
export default async function customerStatementReportRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Customer Statement Reports'] };
    });
    server.get('/', { schema: { querystring: customerStatementQuerySchema } }, getStatementHandler);
}
