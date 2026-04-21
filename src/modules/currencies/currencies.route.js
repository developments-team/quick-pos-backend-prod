import { createCurrencyHandler, getCurrenciesHandler, getCurrencyByIdHandler, updateCurrencyHandler, deleteCurrencyHandler, } from './currencies.controller.js';
import { currencyBodySchema, currencyParamsSchema } from './currencies.schema.js';
export default async function currencyRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Currencies'] };
    });
    server.post('/', { schema: { body: currencyBodySchema } }, createCurrencyHandler);
    server.get('/', getCurrenciesHandler);
    server.get('/:id', { schema: { params: currencyParamsSchema } }, getCurrencyByIdHandler);
    server.patch('/:id', { schema: { params: currencyParamsSchema, body: currencyBodySchema } }, updateCurrencyHandler);
    server.delete('/:id', { schema: { params: currencyParamsSchema } }, deleteCurrencyHandler);
}
