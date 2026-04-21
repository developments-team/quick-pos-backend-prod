import app from './app.js';
import { globalPrisma, cleanupConnections } from './lib/prisma.js';
async function start() {
    try {
        await globalPrisma.$connect();
        console.log('✅ Connection established.');
        const host = process.env.HOST || 'localhost';
        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host });
        console.log(`🚀 App running in ${process.env.NODE_ENV} mode! \n📚 Docs: http://${host}:${port}/docs \n🧑‍💻 API: http://${host}:${port}/api/`);
    }
    catch (err) {
        console.error('🔥 Failed to start server:', err);
        process.exit(1);
    }
}
const handleShutdown = async (signal) => {
    console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
    try {
        await app.close();
        await cleanupConnections();
        console.log('💥 Shutdown complete');
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
};
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
start();
