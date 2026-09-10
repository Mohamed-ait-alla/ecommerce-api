import { z } from "zod";

export const createAddressSchema = z.object({
    body: z.object({
        fullName: z.string().min(1, 'Full name is required').max(100),
        phone: z.string().min(5, 'Phone number is required').max(20),
        street: z.string().min(1, 'Street is required').max(200),
        city: z.string().min(1, 'City is required').max(100),
        postalCode: z.string().min(1, 'Postal code is required').max(20),
        country: z.string().min(1, 'Country is required').max(100),
        isDefault: z.boolean().optional(),
    }),
});

export const addressIdParamSchema = z.object({
    params: z.object({ id: z.uuid() }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
