import "server-only";
import Stripe from "stripe";

let client: Stripe | undefined;

/**
 * Created lazily on first use so the build doesn't require env vars
 * (Vercel collects page data at build time before envs may be set).
 */
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
    }
    client = new Stripe(secretKey);
  }
  return client;
}
