import { z } from "zod";

export const listProductsQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(15).default(5),
        search: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.coerce.number().nonnegative().optional(),
        maxPrice: z.coerce.number().nonnegative().optional(),
        sort: z
            .enum([
                "price",
                "-price",
                "name",
                "-name",
                "createdAt",
                "-createdAt",
            ])
            .default("-createdAt"),
    }),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];
