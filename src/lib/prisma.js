import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
const globalPool = new pg.Pool({
    connectionString: `${connectionString}${connectionString?.includes('?') ? '&' : '?'}search_path=public`,
    max: 2,
});
const globalAdapter = new PrismaPg(globalPool);
export const globalPrisma = new PrismaClient({
    adapter: globalAdapter,
    log: ['error', 'warn'],
});
const tenantClients = {};
const tenantPools = {};
export function getTenantClient(slug) {
    const schemaName = slug;
    if (tenantClients[schemaName])
        return tenantClients[schemaName];
    const pool = new pg.Pool({
        connectionString,
        max: 5,
        idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(pool, { schema: schemaName });
    const client = new PrismaClient({
        adapter,
        log: ['error'],
    });
    tenantPools[schemaName] = pool;
    tenantClients[schemaName] = client;
    return client;
}
export async function cleanupConnections() {
    const poolClosures = Object.values(tenantPools).map((p) => p.end());
    await Promise.all(poolClosures);
    await globalPool.end();
    const clientDisconnections = Object.values(tenantClients).map((c) => c.$disconnect());
    await Promise.all([...clientDisconnections, globalPrisma.$disconnect()]);
}
