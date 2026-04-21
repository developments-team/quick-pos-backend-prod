import { createAdjustmentTypeHandler, getAdjustmentTypesHandler, getAdjustmentTypeByIdHandler, updateAdjustmentTypeHandler, deleteAdjustmentTypeHandler, } from './adjustmentTypes.controller.js';
import { adjustmentTypeBodySchema, adjustmentTypeParamsSchema } from './adjustmentTypes.schema.js';
export default async function adjustmentTypeRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['AdjustmentTypes'] };
    });
    server.post('/', { schema: { body: adjustmentTypeBodySchema } }, createAdjustmentTypeHandler);
    server.get('/', getAdjustmentTypesHandler);
    server.get('/:id', { schema: { params: adjustmentTypeParamsSchema } }, getAdjustmentTypeByIdHandler);
    server.patch('/:id', { schema: { params: adjustmentTypeParamsSchema, body: adjustmentTypeBodySchema } }, updateAdjustmentTypeHandler);
    server.delete('/:id', { schema: { params: adjustmentTypeParamsSchema } }, deleteAdjustmentTypeHandler);
}
