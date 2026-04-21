import { loginHandler } from './auth.controller.js';
import { loginBodySchema } from './auth.schema.js';
export default async function authRoutes(server) {
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Auth'] };
    });
    server.post('/login', { schema: { body: loginBodySchema } }, loginHandler);
}
