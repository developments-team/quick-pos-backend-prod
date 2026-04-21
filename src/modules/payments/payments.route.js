import { createPaymentHandler, getPaymentsHandler, getPaymentByIdHandler, updatePaymentHandler, deletePaymentHandler, } from './payments.controller.js';
import { paymentBodySchema, paymentParamsSchema } from './payments.schema.js';
export default async function paymentRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Payments'] };
    });
    server.post('/', { schema: { body: paymentBodySchema } }, createPaymentHandler);
    server.get('/', getPaymentsHandler);
    server.get('/:id', { schema: { params: paymentParamsSchema } }, getPaymentByIdHandler);
    server.patch('/:id', { schema: { params: paymentParamsSchema, body: paymentBodySchema } }, updatePaymentHandler);
    server.delete('/:id', { schema: { params: paymentParamsSchema } }, deletePaymentHandler);
}
