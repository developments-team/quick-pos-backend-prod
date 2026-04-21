import { uploader } from '../../config/uploader.js';
import { uploadProductsHandler, checkProductSKUsHandler, saveProductsImagesHandler, } from './uploadProducts.controller.js';
import { uploadProductsBodySchema, checkSkusBodySchema } from './uploadProducts.schema.js';
export default async function uploadProductRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Upload Products'] };
    });
    server.post('/', { schema: { body: uploadProductsBodySchema } }, uploadProductsHandler);
    server.post('/check-skus', { schema: { body: checkSkusBodySchema } }, checkProductSKUsHandler);
    server.post('/images', { preValidation: [uploader('product')] }, saveProductsImagesHandler);
}
