import Stripe from "stripe";
import { env } from "../validators/env.validator";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);