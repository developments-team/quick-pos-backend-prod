import { createGroupHandler, getGroupsHandler, getGroupByIdHandler, updateGroupHandler, deleteGroupHandler, } from './groups.controller.js';
import { groupBodySchema, groupParamsSchema } from './groups.schema.js';
export default async function groupRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Groups'] };
    });
    server.post('/', { schema: { body: groupBodySchema } }, createGroupHandler);
    server.get('/', getGroupsHandler);
    server.get('/:id', { schema: { params: groupParamsSchema } }, getGroupByIdHandler);
    server.patch('/:id', { schema: { params: groupParamsSchema, body: groupBodySchema } }, updateGroupHandler);
    server.delete('/:id', { schema: { params: groupParamsSchema } }, deleteGroupHandler);
}
