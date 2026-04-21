import 'dotenv/config';
import { execSync } from 'child_process';
import { globalPrisma } from '../src/lib/prisma.js';
async function migrateAllTenants() {
    const tenants = await globalPrisma.tenant.findMany({});
    console.log(`found ${tenants.length} tenants. Starting migration...`);
    for (const tenant of tenants) {
        const schemaName = tenant.slug;
        console.log(`\n🏗️  Migrating: ${tenant.name} (${schemaName})`);
        try {
            const tenantUrl = `${process.env.DATABASE_URL}?schema=${schemaName}`;
            execSync(`npx prisma migrate deploy`, {
                env: {
                    ...process.env,
                    DATABASE_URL: tenantUrl,
                },
                stdio: 'inherit',
            });
            console.log(`✅ ${tenant.name} migrated successfully.`);
        }
        catch (error) {
            console.error(`❌ Failed to migrate ${tenant.name}:`, error);
        }
    }
    console.log('\n✨ All tenant migrations complete.');
    process.exit(0);
}
migrateAllTenants();
