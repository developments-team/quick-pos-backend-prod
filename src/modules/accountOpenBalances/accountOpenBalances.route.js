import { openCashRegisterHandler, getCashRegisterStatusHandler } from './accountOpenBalances.controller.js';
import { cashRegisterBodySchema } from './accountOpenBalances.schema.js';
export default async function accountOpenBalanceRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Account Open Balances'] };
    });
    server.post('/cash-register', { schema: { body: cashRegisterBodySchema } }, openCashRegisterHandler);
    server.get('/cash-register', getCashRegisterStatusHandler);
}
