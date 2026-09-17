import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// ── Entity shapes, for documentation purposes only ──────────────────────
// These describe what the API RETURNS. They intentionally don't need to be
// as strict as the request validators — they exist to give Swagger UI a
// realistic shape to show, not to validate anything at runtime.

export const userSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.iso.datetime(),
});

export const authTokensSchema = z.object({
  accessToken: z.string(),
  userId: z.uuid(),
});

export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parentId: z.uuid().nullable(),
});

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  sku: z.string(),
  price: z.number(),
  stock: z.number(),
  images: z.array(z.string()),
  isActive: z.boolean(),
  categoryId: z.uuid(),
});

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const cartItemSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  quantity: z.number(),
  subtotal: z.number(),
  product: productSchema.partial(),
});

export const cartSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  items: z.array(cartItemSchema),
  subtotal: z.number(),
});

export const orderItemSchema = z.object({
  id: z.uuid(),
  productId: z.uuid().nullable(),
  productName: z.string(),
  productPrice: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
});

export const orderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export const orderSchema = z.object({
  id: z.uuid(),
  status: orderStatusSchema,
  subtotal: z.number(),
  tax: z.number(),
  shippingCost: z.number(),
  total: z.number(),
  paidAt: z.iso.datetime().nullable(),
  items: z.array(orderItemSchema),
});

export const checkoutResponseSchema = z.object({
  order: orderSchema,
  clientSecret: z.string().nullable(),
});

export const addressSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  phone: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
});

export const dashboardSchema = z.object({
  totalRevenue: z.number(),
  totalOrders: z.number(),
  ordersByStatus: z.array(z.object({ status: z.string(), count: z.number() })),
  totalUsers: z.number(),
  totalProducts: z.number(),
  lowStockCount: z.number(),
});


export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const apiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string().optional(),
    data: dataSchema,
  });

export const paginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  apiResponse(z.object({ items: z.array(itemSchema), meta: paginationMetaSchema }));

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Validation error',
  401: 'Not authenticated',
  403: 'Insufficient permissions',
  404: 'Resource not found',
  409: 'Conflict with current state',
};

export const commonErrors = (...codes: number[]) =>
  Object.fromEntries(
    codes.map((code) => [
      code,
      {
        description: ERROR_DESCRIPTIONS[code] ?? 'Error',
        content: { 'application/json': { schema: errorResponseSchema } },
      },
    ])
  );

export const BEARER_AUTH = 'bearerAuth';

export const refreshTokenCookieSchema = z.object({
  refreshToken: z.string().openapi({
    description: 'HTTP-only refresh token cookie set at login/register',
  }),
});