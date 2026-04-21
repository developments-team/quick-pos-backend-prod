import { createPaymentTypeHandler, getPaymentTypesHandler, getPaymentTypeByIdHandler, updatePaymentTypeHandler, deletePaymentTypeHandler, } from './paymentTypes.controller.js';
import { paymentTypeBodySchema, paymentTypeParamsSchema } from './paymentTypes.schema.js';
export default async function paymentTypeRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['PaymentTypes'] };
    });
    server.post('/', { schema: { body: paymentTypeBodySchema } }, createPaymentTypeHandler);
    server.get('/', getPaymentTypesHandler);
    server.get('/:id', { schema: { params: paymentTypeParamsSchema } }, getPaymentTypeByIdHandler);
    server.patch('/:id', { schema: { params: paymentTypeParamsSchema, body: paymentTypeBodySchema } }, updatePaymentTypeHandler);
    server.delete('/:id', { schema: { params: paymentTypeParamsSchema } }, deletePaymentTypeHandler);
}
