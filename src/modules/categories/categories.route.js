import { createCategoryHandler, getCategoriesHandler, getCategoryByIdHandler, updateCategoryHandler, deleteCategoryHandler, getCategoriesInProductsHandler, } from './categories.controller.js';
import { categoryBodySchema, categoryParamsSchema } from './categories.schema.js';
export default async function categoryRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Categories'] };
    });
    server.post('/', { schema: { body: categoryBodySchema } }, createCategoryHandler);
    server.get('/', getCategoriesHandler);
    server.get('/inProducts', getCategoriesInProductsHandler);
    server.get('/:id', { schema: { params: categoryParamsSchema } }, getCategoryByIdHandler);
    server.patch('/:id', { schema: { params: categoryParamsSchema, body: categoryBodySchema } }, updateCategoryHandler);
    server.delete('/:id', { schema: { params: categoryParamsSchema } }, deleteCategoryHandler);
}
