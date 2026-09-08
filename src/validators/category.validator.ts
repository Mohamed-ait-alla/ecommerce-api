import { z } from "zod";

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];