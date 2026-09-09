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

export const updateCartItemSchema = z.object({
    params: z.object({ productId: z.uuid('Invalid product id') }),
    body: z.object({
        quantity: z.coerce
            .number()
            .int()
            .positive('Quantity cannot be negative'),
    }),
});

export const cartItemParamSchema = z.object({
    params: z.object({ productId: z.uuid('Invalid product id') }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
