import { prisma } from "../config/db";
import { OrderStatus, Prisma } from "../generated/prisma/client";
import { AppError } from "../utils/AppError";
import { env } from "../validators/env.validator";
import { stripe } from "../config/stripe";

export const checkout = async (userId: string, addressId: string) => {
    // check for user's address
    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    });
    if (!address) {
        throw new AppError("Address not found", 404);
    }

    // check for user's cart
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
        throw new AppError("Your cart is empty", 400);
    }

    // building order
    const order = await prisma.$transaction(async (tx) => {
        let subtotal = 0;
        const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

        for (const item of cart.items) {
            if (!item.product.isActive) {
                throw new AppError(
                    `"${item.product.name}" is no longer available`,
                    400,
                );
            }

            // double check for product's stock, if stock is enough decrement the quantity
            const result = await tx.product.updateMany({
                where: { id: item.productId, stock: { gte: item.quantity } },
                data: { stock: { decrement: item.quantity } },
            });

            // if stock is not enough, throw error
            if (result.count === 0) {
                throw new AppError(
                    `Insufficient stock for "${item.product.name}"`,
                    409,
                );
            }

            // calculate subtotal and save items info
            const lineSubtotal = Number(item.product.price) * item.quantity;
            subtotal += lineSubtotal;

            orderItemsData.push({
                productId: item.productId,
                productName: item.product.name,
                productPrice: item.product.price,
                quantity: item.quantity,
                subtotal: lineSubtotal,
            });
        }

        // calculate total && create order
        const tax = Number((subtotal * env.TAX_RATE).toFixed(2));
        const shippingCost = env.SHIPPING_COST;
        const total = Number((subtotal + tax + shippingCost).toFixed(2));

        const createdOrder = await tx.order.create({
            data: {
                userId,
                addressId,
                subtotal,
                tax,
                shippingCost,
                total,
                items: { createMany: { data: orderItemsData } },
            },
            include: { items: true, address: true },
        });

        // remove items from user's cart
        await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        return createdOrder;
    });

    // setup stripe's paymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.total) * 100),
        currency: env.CURRENCY,
        metadata: { orderId: order.id, userId },
    });

    // update order
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { paymentIntentId: paymentIntent.id },
        include: { items: true, address: true },
    });

    return { order: updatedOrder, clientSecret: paymentIntent.client_secret };
};

export const markOrderAsPaid = async (paymentIntentId: string) => {
    const order = await prisma.order.findUnique({ where: { paymentIntentId } });
    if (!order || order.status === OrderStatus.PAID) {
        return;
    }

    await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
    });
};

const restockOrderItems = async (tx: Prisma.TransactionClient, orderId: string) => {
    const items = await tx.orderItem.findMany({ where: { orderId } });

    for (const item of items) {
        if (item.productId) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }
    }
};

export const markOrderPaymentFailed = async (paymentIntentId: string) => {
    const order = await prisma.order.findUnique({ where: { paymentIntentId } });
    if (!order || order.status !== OrderStatus.PENDING) {
        return;
    }

    await prisma.$transaction(async (tx) => {
        await restockOrderItems(tx, order.id);
        await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
        });
    });
};
