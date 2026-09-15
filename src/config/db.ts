import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../validators/env.validator";
import { logger } from "../utils/logger";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const prisma = new PrismaClient({
    adapter,
    log:
        env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        logger.info("Database connected successfully");
    } catch (error) {
        const err = error as Error;
        logger.error("Database connection failed: ", err.message);
    }
};

const disconnectDB = async () => {
    await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };
