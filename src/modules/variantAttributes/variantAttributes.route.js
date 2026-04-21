import { createVariantAttributeHandler, getVariantAttributesHandler, getVariantAttributeByIdHandler, updateVariantAttributeHandler, deleteVariantAttributeHandler, } from './variantAttributes.controller.js';
import { variantAttributeBodySchema, variantAttributeParamsSchema } from './variantAttributes.schema.js';
export default async function variantAttributeRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['VariantAttributes'] };
    });
    server.post('/', { schema: { body: variantAttributeBodySchema } }, createVariantAttributeHandler);
    server.get('/', getVariantAttributesHandler);
    server.get('/:id', { schema: { params: variantAttributeParamsSchema } }, getVariantAttributeByIdHandler);
    server.patch('/:id', { schema: { params: variantAttributeParamsSchema, body: variantAttributeBodySchema } }, updateVariantAttributeHandler);
    server.delete('/:id', { schema: { params: variantAttributeParamsSchema } }, deleteVariantAttributeHandler);
}
