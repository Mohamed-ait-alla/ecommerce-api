import { app } from "./app.js";
import { env } from "./validators/env.validator.js";
import { logger } from "./utils/logger.js";
import { connectDB, disconnectDB } from "./config/db.js";

connectDB();

const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(async () => {
        await disconnectDB();
        logger.info('Shutdown complete');
        process.exit(0);
    });

    // force-exit if shutdown hangs too long
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10_000).unref();
};

// gracefull shutdown on SIGTERM/SIGINT
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections (e.g., database connection errors)
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
    logger.error('Uncaught Exception:', err);
});
