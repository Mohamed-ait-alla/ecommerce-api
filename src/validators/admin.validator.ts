import { z } from "zod";

export const lowStockQuerySchema = z.object({
    query: z.object({
        threshold: z.coerce.number().int().positive().default(10),
    }),
});

export type LowStockQuery = z.infer<typeof lowStockQuerySchema>['query'];
