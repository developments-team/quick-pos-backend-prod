import { getAllInventoryHandler, getAllProductsHandler } from './inventory.controller.js';
import { inventoryQuerySchema } from './inventory.schema.js';
export default async function inventoryRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Inventory'] };
    });
    server.get('/', { schema: { querystring: inventoryQuerySchema } }, getAllInventoryHandler);
    server.get('/products', getAllProductsHandler);
}
