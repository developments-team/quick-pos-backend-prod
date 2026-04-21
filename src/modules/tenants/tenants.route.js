import { uploader } from '../../config/uploader.js';
import { getAllTenantsHandler, getTenantHandler, createTenantHandler, createTenantPublicHandler, updateTenantHandler, deleteTenantHandler, } from './tenants.controller.js';
import { tenantBodySchema, tenantPublicBodySchema, tenantParamsSchema } from './tenants.schema.js';
export default async function tenantRoutes(server) {
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Tenants'] };
    });
    server.post('/public', {
        schema: { consumes: ['multipart/form-data'], body: tenantPublicBodySchema },
        preValidation: [uploader('tenant')],
    }, createTenantPublicHandler);
    server.register(async function protectedRoutes(srv) {
        srv.addHook('onRequest', srv.authenticate);
        srv.get('/', getAllTenantsHandler);
        srv.get('/:id', { schema: { params: tenantParamsSchema } }, getTenantHandler);
        srv.post('/', { schema: { consumes: ['multipart/form-data'], body: tenantBodySchema }, preValidation: [uploader('tenant')] }, createTenantHandler);
        srv.put('/:id', {
            schema: { consumes: ['multipart/form-data'], params: tenantParamsSchema, body: tenantBodySchema },
            preValidation: [uploader('tenant')],
        }, updateTenantHandler);
        srv.delete('/:id', { schema: { params: tenantParamsSchema } }, deleteTenantHandler);
    });
}
