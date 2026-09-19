import Stripe from "stripe";
import { env } from "../validators/env.validator.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);