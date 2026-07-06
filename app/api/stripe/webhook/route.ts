import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { updateOrder } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : err}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (orderId) {
      const order = await updateOrder(orderId, {
        payment_status: "paid",
        order_status: "paid",
      });

      if (order) {
        try {
          await sendOrderConfirmationEmail(order);
        } catch (err) {
          console.error("Failed to send order confirmation email:", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
