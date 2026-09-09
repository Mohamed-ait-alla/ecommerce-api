import { prisma } from "../config/db";
import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import type {
    AddCartItemInput,
    UpdateCartItemInput,
} from "../validators/cart.validator";

const cartInclude = {
    items: {
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                    images: true,
                    isActive: true,
                },
            },
        },
    },
} satisfies Prisma.CartInclude;

type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

const getOrCreateCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: cartInclude,
    });
    if (cart) return cart;

    return await prisma.cart.create({ data: { userId }, include: cartInclude });
};

const withTotals = (cart: CartWithItems) => {
    const items = cart.items.map((item) => ({
        ...item,
        subtotal: Number(item.product.price) * item.quantity,
    }));

    const subTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    return { ...cart, items, subTotal };
};

export const getCart = async (userId: string) => {
    const cart = await getOrCreateCart(userId);

    return withTotals(cart);
};

export const addItemToCart = async (userId: string, input: AddCartItemInput) => {
    const cart = await getOrCreateCart(userId);

    // check product if exists before adding to cart
    const product = await prisma.product.findUnique({
        where: { id: input.productId },
    });
    if (!product || !product.isActive) {
        throw new AppError("Product not found", 404);
    }

    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: { cartId: cart.id, productId: input.productId },
        },
    });

    // check against the TOTAL desired quantity (existing + new), This prevents bypassing stock limits
    const desiredQuantity = (existingItem?.quantity ?? 0) + input.quantity;
    if (desiredQuantity > product.stock) {
        throw new AppError(
            `Only ${product.stock} unit(s) of this product are available`,
            400,
        );
    }

    // add item or update quantity if item already exists in cart
    await prisma.cartItem.upsert({
        where: {
            cartId_productId: { cartId: cart.id, productId: input.productId },
        },
        create: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
        },
        update: { quantity: desiredQuantity },
    });

    return getCart(userId);
};

export const updateCartItem = async (userId: string, productId: string, input: UpdateCartItemInput) => {
    const cart = await getOrCreateCart(userId);

    // check for item existence
    const item = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
        include: { product: true },
    });
    if (!item) {
        throw new AppError("This product is not in your cart", 404);
    }

    // check for stock limits
    if (input.quantity > item.product.stock) {
        throw new AppError(
            `Only ${item.product.stock} unit(s) of this product are available`,
            400,
        );
    }

    // update item's quantity
    await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: { quantity: input.quantity },
    });

    return getCart(userId);
};

export const deleteCartItem = async (userId: string, productId: string) => {
    const cart = await getOrCreateCart(userId);

    // check for item existence
    const item = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!item) {
        throw new AppError("This product is not in your cart", 404);
    }

	// delete item from cart
    await prisma.cartItem.delete({
        where: { cartId_productId: { cartId: cart.id, productId } },
    });

    return getCart(userId);
};
