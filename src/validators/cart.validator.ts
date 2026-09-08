import { z } from "zod";

export const addCartItemSchema = z.object({
    body: z.object({
        productId: z.uuid('Invalid product id'),
        quantity: z.coerce
            .number()
            .int()
            .positive('Quantity cannot be negative')
            .default(1),
    }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
