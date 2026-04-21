import { deleteAllDataHandler } from './utilities.controller.js';
export default async function utilityRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Utilities'] };
    });
    server.delete('/deleteAll', deleteAllDataHandler);
}
