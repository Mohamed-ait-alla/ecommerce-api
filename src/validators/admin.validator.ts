import { z } from "zod";

export const lowStockQuerySchema = z.object({
    query: z.object({
        threshold: z.coerce.number().int().positive().default(10),
    }),
});

export const listUsersQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(30).default(10),
        isActive: z.coerce.boolean().optional(),
    }),
});

export type LowStockQuery = z.infer<typeof lowStockQuerySchema>['query'];
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>['query'];
