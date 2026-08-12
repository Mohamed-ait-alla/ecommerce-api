import { z } from "zod";
import { exit } from "node:process";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z
        .string()
        .regex(/^\d+$/, "PORT must be an integer")
        .default("3000")
        .transform(Number),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.log("❌ Invalid environment variables:");
    console.log(z.flattenError(parsedEnv.error).fieldErrors);
    exit(1);
}

export const env = parsedEnv.data;
