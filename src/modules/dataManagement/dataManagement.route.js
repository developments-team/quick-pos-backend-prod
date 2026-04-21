import { deleteAllDataHandler } from './dataManagement.controller.js';
export default async function dataManagementRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Data Management'] };
    });
    server.delete('/all', deleteAllDataHandler);
}
