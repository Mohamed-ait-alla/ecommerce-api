import type { Request, Response } from "express";
import { env } from "../validators/env.validator";
import { AppError } from "../utils/AppError";
import Stripe from "stripe";
import * as orderService from "../services/order.service";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        event = Stripe.webhooks.constructEvent(
            req.body,
            signature as string,
            env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (error) {
        throw new AppError('Invalid webhook signature', 400);
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            const intent = event.data.object as Stripe.PaymentIntent;
            await orderService.markOrderAsPaid(intent.id);
            break;
        }
        case 'payment_intent.payment_failed': {
            const intent = event.data.object as Stripe.PaymentIntent;
            await orderService.markOrderPaymentFailed(intent.id);
            break;
        }
        default:
            break;
    }

    res.status(200).json({ received: true });
};
