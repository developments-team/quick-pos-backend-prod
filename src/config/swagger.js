import fs from 'fs';
import path from 'path';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
const getBase64 = (file) => {
    try {
        return fs.readFileSync(path.join(process.cwd(), 'public', file));
    }
    catch (e) {
        return Buffer.from('');
    }
};
export async function registerSwagger(app) {
    app.register(fastifySwagger, {
        openapi: {
            info: { title: 'QuickPos API', version: '1.0' },
            components: {
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                },
            },
            security: [{ bearerAuth: [] }],
        },
    });
    app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        logo: { type: 'image/svg+xml', content: getBase64('swagger-logo.svg') },
        theme: {
            favicon: [
                {
                    filename: 'favicon-32x32.png',
                    rel: 'icon',
                    sizes: '32x32',
                    type: 'image/png',
                    content: getBase64('favicon-32x32.png'),
                },
            ],
        },
        uiConfig: {
            layout: 'StandaloneLayout',
            filter: false,
            docExpansion: 'list',
            persistAuthorization: true,
            urls: [
                { url: '/docs/json', name: 'QuickPos API v1' },
            ],
        },
    });
    app.addHook('onRequest', (request, reply, done) => {
        const auth = request.headers.authorization;
        if (auth && !auth.startsWith('Bearer ') && auth !== 'Bearer') {
            request.headers.authorization = `Bearer ${auth}`;
        }
        done();
    });
}
