import { createCostTypeHandler, getCostTypesHandler, getCostTypeByIdHandler, updateCostTypeHandler, deleteCostTypeHandler, } from './costTypes.controller.js';
import { costTypeBodySchema, costTypeParamsSchema } from './costTypes.schema.js';
export default async function costTypeRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['CostTypes'] };
    });
    server.post('/', { schema: { body: costTypeBodySchema } }, createCostTypeHandler);
    server.get('/', getCostTypesHandler);
    server.get('/:id', { schema: { params: costTypeParamsSchema } }, getCostTypeByIdHandler);
    server.patch('/:id', { schema: { params: costTypeParamsSchema, body: costTypeBodySchema } }, updateCostTypeHandler);
    server.delete('/:id', { schema: { params: costTypeParamsSchema } }, deleteCostTypeHandler);
}
