import { uploader } from '../../config/uploader.js';
import { createProductHandler, getProductsHandler, getProductByIdHandler, updateProductHandler, deleteProductHandler, getProductsByCategoryHandler, } from './products.controller.js';
import { productBodySchema, productBodyUpdateSchema, productParamsSchema } from './products.schema.js';
export default async function productRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Products'] };
    });
    server.post('/', { schema: { consumes: ['multipart/form-data'], body: productBodySchema }, preValidation: [uploader('product')] }, createProductHandler);
    server.get('/', getProductsHandler);
    server.get('/category/:id', getProductsByCategoryHandler);
    server.get('/:id', { schema: { params: productParamsSchema } }, getProductByIdHandler);
    server.patch('/:id', { schema: { params: productParamsSchema, body: productBodyUpdateSchema } }, updateProductHandler);
    server.delete('/:id', { schema: { params: productParamsSchema } }, deleteProductHandler);
}
