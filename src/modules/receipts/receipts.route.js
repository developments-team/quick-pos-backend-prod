import { createReceiptHandler, getReceiptsHandler, getReceiptByIdHandler, updateReceiptHandler, deleteReceiptHandler, } from './receipts.controller.js';
import { receiptBodySchema, receiptParamsSchema } from './receipts.schema.js';
export default async function receiptRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Receipts'] };
    });
    server.post('/', { schema: { body: receiptBodySchema } }, createReceiptHandler);
    server.get('/', getReceiptsHandler);
    server.get('/:id', { schema: { params: receiptParamsSchema } }, getReceiptByIdHandler);
    server.patch('/:id', { schema: { params: receiptParamsSchema, body: receiptBodySchema } }, updateReceiptHandler);
    server.delete('/:id', { schema: { params: receiptParamsSchema } }, deleteReceiptHandler);
}
