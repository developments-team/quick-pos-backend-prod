import { createPlanHandler, getPlansHandler, getPlanByIdHandler, updatePlanHandler, deletePlanHandler, getPlansForPublicHandler, } from './plans.controller.js';
import { planBodySchema, planParamsSchema } from './plans.schema.js';
export default async function planRoutes(server) {
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Plans'] };
    });
    server.get('/public', getPlansForPublicHandler);
    server.register(async function protectedRoutes(srv) {
        srv.addHook('onRequest', srv.authenticate);
        srv.post('/', { schema: { body: planBodySchema } }, createPlanHandler);
        srv.get('/', getPlansHandler);
        srv.get('/:id', { schema: { params: planParamsSchema } }, getPlanByIdHandler);
        srv.patch('/:id', { schema: { params: planParamsSchema, body: planBodySchema } }, updatePlanHandler);
        srv.delete('/:id', { schema: { params: planParamsSchema } }, deletePlanHandler);
    });
}
