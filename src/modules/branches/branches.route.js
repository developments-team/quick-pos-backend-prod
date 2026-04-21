import { createBranchHandler, getBranchesHandler, getBranchByIdHandler, updateBranchHandler, deleteBranchHandler, } from './branches.controller.js';
import { branchBodySchema, branchParamsSchema } from './branches.schema.js';
export default async function branchRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Branches'] };
    });
    server.post('/', { schema: { body: branchBodySchema } }, createBranchHandler);
    server.get('/', getBranchesHandler);
    server.get('/:id', { schema: { params: branchParamsSchema } }, getBranchByIdHandler);
    server.patch('/:id', { schema: { params: branchParamsSchema, body: branchBodySchema } }, updateBranchHandler);
    server.delete('/:id', { schema: { params: branchParamsSchema } }, deleteBranchHandler);
}
