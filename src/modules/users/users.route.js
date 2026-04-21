import { createUserHandler, getUsersHandler, getUserByIdHandler, updateUserHandler, deleteUserHandler, } from './users.controller.js';
import { userBodySchema, userParamsSchema } from './users.schema.js';
export default async function userRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Users'] };
    });
    server.post('/', { schema: { body: userBodySchema } }, createUserHandler);
    server.get('/', getUsersHandler);
    server.get('/:id', { schema: { params: userParamsSchema } }, getUserByIdHandler);
    server.patch('/:id', { schema: { params: userParamsSchema, body: userBodySchema } }, updateUserHandler);
    server.delete('/:id', { schema: { params: userParamsSchema } }, deleteUserHandler);
}
