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

export const productIdParamSchema = z.object({
    params: z.object({
        id: z.uuid(),
    }),
});

export const addProductSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(200),
        description: z.string().min(1),
        sku: z.string().min(1).max(50),
        price: z.number().positive("Price must be greater than 0"),
        stock: z.number().int().nonnegative().default(0),
        images: z.array(z.url()).optional().default([]),
        categoryId: z.uuid("Invalid category id"),
    }),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];
export type AddProductsInput = z.infer<typeof addProductSchema>['body'];
