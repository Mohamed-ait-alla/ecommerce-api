import { z } from "zod";
import { exit } from "node:process";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z
        .string()
        .regex(/^\d+$/, "PORT must be an integer")
        .default("3000")
        .transform(Number),

    DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),

    JWT_ACCESS_SECRET: z
        .string()
        .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z
        .string()
        .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    BCRYPT_SALT_ROUNDS: z.coerce.number().default(10),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.log("❌ Invalid environment variables:");
    console.log(z.flattenError(parsedEnv.error).fieldErrors);
    exit(1);
}

export const env = parsedEnv.data;
