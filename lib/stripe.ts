import "server-only";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY!;

export const stripe = new Stripe(secretKey);
