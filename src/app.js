import 'dotenv/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyAutoload from '@fastify/autoload';
import { SignJWT, jwtVerify } from 'jose';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCompress from '@fastify/compress';
import fastifyMultipart from '@fastify/multipart';
import { registerSwagger } from './config/swagger.js';
import ajvErrors from 'ajv-errors';
import { globalPrisma, getTenantClient } from './lib/prisma.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './utils/globalError.js';
const app = Fastify({
    ajv: {
        customOptions: {
            coerceTypes: true,
            removeAdditional: true,
            allErrors: true,
        },
        plugins: [ajvErrors],
    },
});
app.register(fastifyHelmet, { contentSecurityPolicy: false });
app.register(fastifyCors, { origin: ['*'], methods: ['GET', 'POST', 'DELETE', 'PATCH'] });
app.register(fastifyCompress, { global: true, threshold: 1024 });
app.register(fastifyMultipart);
app.register(fastifyRateLimit, {
    max: 1000,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.headers['x-tenant-slug'] || request.ip,
    errorResponseBuilder: () => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Too many requests for this store, please try again in a minute.',
    }),
});
registerSwagger(app);
app.addHook('onRequest', async (request, reply) => {
    const tenantSlug = request.headers['x-tenant-slug'];
    if (request.url.startsWith('/docs') || request.url.startsWith('/public') || request.url.startsWith('/api/auth'))
        return;
    if (tenantSlug === 'ADMIN')
        return;
    if (!tenantSlug)
        return;
    if (!tenantSlug && request.url.startsWith('/api')) {
        throw new AppError('Missing x-tenant-slug header. Please provide your store slug.', 400);
    }
    if (!tenantSlug)
        return;
    const tenant = await globalPrisma.tenant.findUnique({
        where: { slug: tenantSlug },
    });
    if (!tenant) {
        throw new AppError('Store not found. Check your x-tenant-slug header.', 404);
    }
    request.prisma = getTenantClient(tenant.slug);
    request.tenantId = tenant.id;
});
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
app.decorate('authenticate', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Not authorized, no token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        });
        request.user = payload.user;
    }
    catch (err) {
        throw new AppError('Not authorized, please login', 401);
    }
});
app.decorate('jwtSign', async (payload) => {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.register(fastifyAutoload, {
    dir: join(__dirname, 'modules'),
    matchFilter: /.*\.route\.(ts|js)$/,
    autoHooks: true,
    cascadeHooks: true,
    options: { prefix: '/api' },
});
app.setNotFoundHandler(() => {
    throw new AppError('Route not found', 404);
});
app.setErrorHandler(globalErrorHandler);
export default app;
