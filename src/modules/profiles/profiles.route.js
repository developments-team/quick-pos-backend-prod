import { uploader } from '../../config/uploader.js';
import { setupProfileHandler, getProfileByIdHandler, updateProfileHandler } from './profiles.controller.js';
import { profileBodySchema, profileParamsSchema } from './profiles.schema.js';
export default async function profileRoutes(server) {
    server.addHook('onRequest', server.authenticate);
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Profiles'] };
    });
    server.post('/', { schema: { consumes: ['multipart/form-data'], body: profileBodySchema }, preValidation: [uploader('profile')] }, setupProfileHandler);
    server.get('/:id', { schema: { params: profileParamsSchema } }, getProfileByIdHandler);
    server.patch('/:id', {
        schema: { consumes: ['multipart/form-data'], params: profileParamsSchema, body: profileBodySchema },
        preValidation: [uploader('profile')],
    }, updateProfileHandler);
}
