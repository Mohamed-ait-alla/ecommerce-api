import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
    userSchema,
    authTokensSchema,
    categorySchema,
    productSchema,
    cartSchema,
    orderSchema,
    checkoutResponseSchema,
    addressSchema,
    dashboardSchema,
    paginatedResponse,
    apiResponse,
    commonErrors,
    BEARER_AUTH,
    refreshTokenCookieSchema,
} from "./schemas";

import { registerSchema, loginSchema } from "../validators/auth.validator";
import {
    addProductSchema,
    updateProductSchema,
    listProductsQuerySchema,
    adjustStockSchema,
} from "../validators/product.validator";
import {
    createCategorySchema,
    updateCategorySchema,
} from "../validators/category.validator";
import {
    addCartItemSchema,
    updateCartItemSchema,
} from "../validators/cart.validator";
import {
    checkoutSchema,
    listOrdersQuerySchema,
    updateOrderStatusSchema,
} from "../validators/order.validator";
import {
    createAddressSchema,
    updateAddressSchema,
} from "../validators/address.validator";
import {
    lowStockQuerySchema,
    listUsersQuerySchema,
    updateUserStatusSchema,
} from "../validators/admin.validator";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", BEARER_AUTH, {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Access token returned from /auth/login or /auth/register",
});

const auth = [{ [BEARER_AUTH]: [] }];

// ── Auth ──────────────────────────────────────────────────────────────
registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "Create a new account",
    request: {
        body: {
            content: {
                "application/json": { schema: registerSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Account created",
            content: {
                "application/json": { schema: apiResponse(authTokensSchema) },
            },
        },
        ...commonErrors(400, 409),
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Log in with email and password",
    request: {
        body: {
            content: { "application/json": { schema: loginSchema.shape.body } },
        },
    },
    responses: {
        200: {
            description: "Logged in",
            content: {
                "application/json": { schema: apiResponse(authTokensSchema) },
            },
        },
        ...commonErrors(400, 401),
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/refresh-token",
    tags: ["Auth"],
    summary:
        "Exchange the refresh token cookie for a new access token (rotates the refresh cookie)",
    request: { cookies: refreshTokenCookieSchema },
    responses: {
        200: {
            description:
                "New access token issued; a new refreshToken cookie is set via Set-Cookie",
            content: {
                "application/json": {
                    schema: apiResponse(
                        authTokensSchema.pick({ accessToken: true }),
                    ),
                },
            },
        },
        ...commonErrors(401),
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Auth"],
    summary: "Revoke the refresh token cookie",
    request: { cookies: refreshTokenCookieSchema },
    responses: { 200: { description: "Logged out" }, ...commonErrors(401) },
});

registry.registerPath({
    method: "get",
    path: "/auth/me",
    tags: ["Auth"],
    summary: "Get the currently authenticated user",
    security: auth,
    responses: {
        200: {
            description: "Current user",
            content: {
                "application/json": { schema: apiResponse(userSchema) },
            },
        },
        ...commonErrors(401),
    },
});

// ── Products ──────────────────────────────────────────────────────────
registry.registerPath({
    method: "get",
    path: "/products",
    tags: ["Products"],
    summary:
        "List products (public) — supports pagination, search, filtering, and sorting",
    request: { query: listProductsQuerySchema.shape.query },
    responses: {
        200: {
            description: "Paginated product list",
            content: {
                "application/json": {
                    schema: paginatedResponse(productSchema),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/products/{id}",
    tags: ["Products"],
    summary: "Get a single product by id",
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        200: {
            description: "Product",
            content: {
                "application/json": { schema: apiResponse(productSchema) },
            },
        },
        ...commonErrors(404),
    },
});

registry.registerPath({
    method: "post",
    path: "/products",
    tags: ["Products"],
    summary: "Create a product (admin only)",
    security: auth,
    request: {
        body: {
            content: {
                "application/json": { schema: addProductSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Product created",
            content: {
                "application/json": { schema: apiResponse(productSchema) },
            },
        },
        ...commonErrors(400, 401, 403, 404, 409),
    },
});

registry.registerPath({
    method: "put",
    path: "/products/{id}",
    tags: ["Products"],
    summary: "Update a product (admin only)",
    security: auth,
    request: {
        params: updateProductSchema.shape.params,
        body: {
            content: {
                "application/json": { schema: updateProductSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Product updated",
            content: {
                "application/json": { schema: apiResponse(productSchema) },
            },
        },
        ...commonErrors(400, 401, 403, 404),
    },
});

registry.registerPath({
    method: "delete",
    path: "/products/{id}",
    tags: ["Products"],
    summary: "Soft-delete a product (admin only)",
    security: auth,
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        200: { description: "Product deleted" },
        ...commonErrors(401, 403, 404),
    },
});

registry.registerPath({
    method: "patch",
    path: "/products/{id}/inventory",
    tags: ["Products"],
    summary:
        "Adjust stock — positive to restock, negative to deduct (admin only)",
    security: auth,
    request: {
        params: adjustStockSchema.shape.params,
        body: {
            content: {
                "application/json": { schema: adjustStockSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Stock adjusted",
            content: {
                "application/json": { schema: apiResponse(productSchema) },
            },
        },
        ...commonErrors(400, 401, 403, 404),
    },
});

// ── Categories ────────────────────────────────────────────────────────
registry.registerPath({
    method: "get",
    path: "/categories",
    tags: ["Categories"],
    summary: "List top-level categories with nested children",
    responses: {
        200: {
            description: "Category list",
            content: {
                "application/json": {
                    schema: apiResponse(z.array(categorySchema)),
                },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/categories",
    tags: ["Categories"],
    summary: "Create a category (admin only)",
    security: auth,
    request: {
        body: {
            content: {
                "application/json": { schema: createCategorySchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Category created",
            content: {
                "application/json": { schema: apiResponse(categorySchema) },
            },
        },
        ...commonErrors(400, 401, 403),
    },
});

registry.registerPath({
    method: "put",
    path: "/categories/{id}",
    tags: ["Categories"],
    summary: "Update a category (admin only)",
    security: auth,
    request: {
        params: updateCategorySchema.shape.params,
        body: {
            content: {
                "application/json": { schema: updateCategorySchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Category updated",
            content: {
                "application/json": { schema: apiResponse(categorySchema) },
            },
        },
        ...commonErrors(400, 401, 403, 404),
    },
});

registry.registerPath({
    method: "delete",
    path: "/categories/{id}",
    tags: ["Categories"],
    summary:
        "Delete a category (admin only) — blocked if it still has products",
    security: auth,
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        200: { description: "Category deleted" },
        ...commonErrors(401, 403, 404, 409),
    },
});

// ── Cart ──────────────────────────────────────────────────────────────
registry.registerPath({
    method: "get",
    path: "/cart",
    tags: ["Cart"],
    summary: "Get the authenticated user's cart, with live totals",
    security: auth,
    responses: {
        200: {
            description: "Cart",
            content: {
                "application/json": { schema: apiResponse(cartSchema) },
            },
        },
        ...commonErrors(401),
    },
});

registry.registerPath({
    method: "post",
    path: "/cart/items",
    tags: ["Cart"],
    summary:
        "Add a product to the cart (or increment its quantity if already present)",
    security: auth,
    request: {
        body: {
            content: {
                "application/json": { schema: addCartItemSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Item added",
            content: {
                "application/json": { schema: apiResponse(cartSchema) },
            },
        },
        ...commonErrors(400, 401, 404),
    },
});

registry.registerPath({
    method: "patch",
    path: "/cart/items/{productId}",
    tags: ["Cart"],
    summary: "Set the exact quantity of a product already in the cart",
    security: auth,
    request: {
        params: updateCartItemSchema.shape.params,
        body: {
            content: {
                "application/json": { schema: updateCartItemSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Cart item updated",
            content: {
                "application/json": { schema: apiResponse(cartSchema) },
            },
        },
        ...commonErrors(400, 401, 404),
    },
});

registry.registerPath({
    method: "delete",
    path: "/cart/items/{productId}",
    tags: ["Cart"],
    summary: "Remove a product from the cart",
    security: auth,
    request: { params: z.object({ productId: z.string().uuid() }) },
    responses: {
        200: {
            description: "Item removed",
            content: {
                "application/json": { schema: apiResponse(cartSchema) },
            },
        },
        ...commonErrors(401, 404),
    },
});

registry.registerPath({
    method: "delete",
    path: "/cart",
    tags: ["Cart"],
    summary: "Empty the entire cart",
    security: auth,
    responses: {
        200: {
            description: "Cart cleared",
            content: {
                "application/json": { schema: apiResponse(cartSchema) },
            },
        },
        ...commonErrors(401),
    },
});

// ── Orders ────────────────────────────────────────────────────────────
registry.registerPath({
    method: "post",
    path: "/orders/checkout",
    tags: ["Orders"],
    summary:
        "Convert the cart into a PENDING order and create a Stripe PaymentIntent",
    security: auth,
    request: {
        body: {
            content: {
                "application/json": { schema: checkoutSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Order created — pay using the returned clientSecret",
            content: {
                "application/json": {
                    schema: apiResponse(checkoutResponseSchema),
                },
            },
        },
        ...commonErrors(400, 401, 404, 409),
    },
});

registry.registerPath({
    method: "get",
    path: "/orders",
    tags: ["Orders"],
    summary: "List the authenticated user's own orders",
    security: auth,
    request: { query: listOrdersQuerySchema.shape.query },
    responses: {
        200: {
            description: "Paginated order list",
            content: {
                "application/json": { schema: paginatedResponse(orderSchema) },
            },
        },
        ...commonErrors(401),
    },
});

registry.registerPath({
    method: "get",
    path: "/orders/{id}",
    tags: ["Orders"],
    summary: "Get one of the authenticated user's own orders",
    security: auth,
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        200: {
            description: "Order",
            content: {
                "application/json": { schema: apiResponse(orderSchema) },
            },
        },
        ...commonErrors(401, 404),
    },
});

// ── Addresses ─────────────────────────────────────────────────────────
registry.registerPath({
    method: "get",
    path: "/addresses",
    tags: ["Addresses"],
    summary: "List the authenticated user's saved addresses",
    security: auth,
    responses: {
        200: {
            description: "Address list",
            content: {
                "application/json": {
                    schema: apiResponse(z.array(addressSchema)),
                },
            },
        },
        ...commonErrors(401),
    },
});

registry.registerPath({
    method: "post",
    path: "/addresses",
    tags: ["Addresses"],
    summary: "Add a new address (first address becomes default automatically)",
    security: auth,
    request: {
        body: {
            content: {
                "application/json": { schema: createAddressSchema.shape.body },
            },
        },
    },
    responses: {
        201: {
            description: "Address added",
            content: {
                "application/json": { schema: apiResponse(addressSchema) },
            },
        },
        ...commonErrors(400, 401),
    },
});

registry.registerPath({
    method: "put",
    path: "/addresses/{id}",
    tags: ["Addresses"],
    summary:
        "Update an address; isDefault: true unsets it on the user's others",
    security: auth,
    request: {
        params: updateAddressSchema.shape.params,
        body: {
            content: {
                "application/json": { schema: updateAddressSchema.shape.body },
            },
        },
    },
    responses: {
        200: {
            description: "Address updated",
            content: {
                "application/json": { schema: apiResponse(addressSchema) },
            },
        },
        ...commonErrors(400, 401, 404),
    },
});

registry.registerPath({
    method: "delete",
    path: "/addresses/{id}",
    tags: ["Addresses"],
    summary:
        "Delete an address (promotes another to default if this one was it)",
    security: auth,
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        200: { description: "Address deleted" },
        ...commonErrors(401, 404),
    },
});

// ── Admin ─────────────────────────────────────────────────────────────
registry.registerPath({
    method: "get",
    path: "/admin/dashboard",
    tags: ["Admin"],
    summary: "Revenue, order, user, and inventory summary (admin only)",
    security: auth,
    responses: {
        200: {
            description: "Dashboard stats",
            content: {
                "application/json": { schema: apiResponse(dashboardSchema) },
            },
        },
        ...commonErrors(401, 403),
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/orders",
    tags: ["Admin"],
    summary: "List all orders across all users (admin only)",
    security: auth,
    request: { query: listOrdersQuerySchema.shape.query },
    responses: {
        200: {
            description: "Paginated order list",
            content: {
                "application/json": { schema: paginatedResponse(orderSchema) },
            },
        },
        ...commonErrors(401, 403),
    },
});

registry.registerPath({
    method: "patch",
    path: "/admin/orders/{id}/status",
    tags: ["Admin"],
    summary:
        "Move an order to a new status; cancelling/refunding restocks its items (admin only)",
    security: auth,
    request: {
        params: updateOrderStatusSchema.shape.params,
        body: {
            content: {
                "application/json": {
                    schema: updateOrderStatusSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Order status updated",
            content: {
                "application/json": { schema: apiResponse(orderSchema) },
            },
        },
        ...commonErrors(400, 401, 403, 404),
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/products/low-stock",
    tags: ["Admin"],
    summary:
        "List products at or below a stock threshold (admin only, default threshold 10)",
    security: auth,
    request: { query: lowStockQuerySchema.shape.query },
    responses: {
        200: {
            description: "Low-stock products",
            content: {
                "application/json": {
                    schema: apiResponse(z.array(productSchema)),
                },
            },
        },
        ...commonErrors(401, 403),
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/users",
    tags: ["Admin"],
    summary: "List regular user accounts (admin only)",
    security: auth,
    request: { query: listUsersQuerySchema.shape.query },
    responses: {
        200: {
            description: "Paginated user list",
            content: {
                "application/json": { schema: paginatedResponse(userSchema) },
            },
        },
        ...commonErrors(401, 403),
    },
});

registry.registerPath({
    method: "patch",
    path: "/admin/users/{id}/status",
    tags: ["Admin"],
    summary:
        "Activate or deactivate a user account (admin only, cannot target other admins)",
    security: auth,
    request: {
        params: updateUserStatusSchema.shape.params,
        body: {
            content: {
                "application/json": {
                    schema: updateUserStatusSchema.shape.body,
                },
            },
        },
    },
    responses: {
        200: {
            description: "User status updated",
            content: {
                "application/json": { schema: apiResponse(userSchema) },
            },
        },
        ...commonErrors(401, 403, 404),
    },
});

// ── Document generation ───────────────────────────────────────────────
const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
    openapi: "3.0.0",
    info: {
        title: "E-commerce API",
        version: "1.0.0",
        description:
            "A learning-project REST API for an e-commerce backend: auth, product catalog, cart, checkout with Stripe, and admin management.",
    },
    servers: [{ url: "http://localhost:3000/", description: "Local dev" }],
});
