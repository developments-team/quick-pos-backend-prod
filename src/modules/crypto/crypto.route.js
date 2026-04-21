import { encryptPlainTextHandler, decryptCipherTextHandler } from './crypto.controller.js';
import { encryptBodySchema, decryptBodySchema } from './crypto.schema.js';
export default async function cryptoRoutes(server) {
    server.addHook('onRoute', (routeOptions) => {
        routeOptions.schema = { ...routeOptions.schema, tags: ['Crypto'] };
    });
    server.post('/encrypt', { schema: { body: encryptBodySchema } }, encryptPlainTextHandler);
    server.post('/decrypt', { schema: { body: decryptBodySchema } }, decryptCipherTextHandler);
}
