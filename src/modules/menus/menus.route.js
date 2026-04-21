import { createMenuHandler, getMenusHandler, getMenuByIdHandler, updateMenuHandler, deleteMenuHandler, getNavigationMenusHandler, } from './menus.controller.js';
import { menuBodySchema, menuParamsSchema, menusQuerySchema, navigationMenusParamsSchema } from './menus.schema.js';
export default async function menuRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Menus'] };
    });
    server.post('/', { schema: { body: menuBodySchema } }, createMenuHandler);
    server.get('/', { schema: { querystring: menusQuerySchema } }, getMenusHandler);
    server.get('/navigation/:roleId', { schema: { params: navigationMenusParamsSchema } }, getNavigationMenusHandler);
    server.get('/:id', { schema: { params: menuParamsSchema } }, getMenuByIdHandler);
    server.patch('/:id', { schema: { params: menuParamsSchema, body: menuBodySchema } }, updateMenuHandler);
    server.delete('/:id', { schema: { params: menuParamsSchema } }, deleteMenuHandler);
}
