import { createUnitHandler, getUnitsHandler, getUnitByIdHandler, updateUnitHandler, deleteUnitHandler, } from './units.controller.js';
import { unitBodySchema, unitParamsSchema } from './units.schema.js';
export default async function unitRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Units'] };
    });
    server.post('/', { schema: { body: unitBodySchema } }, createUnitHandler);
    server.get('/', getUnitsHandler);
    server.get('/:id', { schema: { params: unitParamsSchema } }, getUnitByIdHandler);
    server.patch('/:id', { schema: { params: unitParamsSchema, body: unitBodySchema } }, updateUnitHandler);
    server.delete('/:id', { schema: { params: unitParamsSchema } }, deleteUnitHandler);
}
