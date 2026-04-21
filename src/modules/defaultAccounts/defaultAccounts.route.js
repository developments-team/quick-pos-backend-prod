import { saveDefaultAccountsHandler, getDefaultAccountsHandler, getDefaultAccountByIdHandler, deleteDefaultAccountHandler, } from './defaultAccounts.controller.js';
import { defaultAccountBodySchema, defaultAccountParamsSchema } from './defaultAccounts.schema.js';
export default async function defaultAccountRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['DefaultAccounts'] };
    });
    server.post('/', { schema: { body: defaultAccountBodySchema } }, saveDefaultAccountsHandler);
    server.get('/', getDefaultAccountsHandler);
    server.get('/:id', { schema: { params: defaultAccountParamsSchema } }, getDefaultAccountByIdHandler);
    server.delete('/:id', { schema: { params: defaultAccountParamsSchema } }, deleteDefaultAccountHandler);
}
