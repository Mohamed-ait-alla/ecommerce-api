import { prisma } from "../config/db";
import type { Prisma } from "../generated/prisma/client";

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
