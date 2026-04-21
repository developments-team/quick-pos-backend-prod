import { createBrandHandler, getBrandsHandler, getBrandByIdHandler, updateBrandHandler, deleteBrandHandler, } from './brands.controller.js';
import { brandBodySchema, brandParamsSchema } from './brands.schema.js';
export default async function brandRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Brands'] };
    });
    server.post('/', { schema: { body: brandBodySchema } }, createBrandHandler);
    server.get('/', getBrandsHandler);
    server.get('/:id', { schema: { params: brandParamsSchema } }, getBrandByIdHandler);
    server.patch('/:id', { schema: { params: brandParamsSchema, body: brandBodySchema } }, updateBrandHandler);
    server.delete('/:id', { schema: { params: brandParamsSchema } }, deleteBrandHandler);
}
