import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { OrderRecord } from "@/lib/types";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
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
      const { data: order } = await getSupabaseAdmin()
        .from("orders")
        .update({ payment_status: "paid", order_status: "paid" })
        .eq("id", orderId)
        .select()
        .single();

      if (order) {
        try {
          await sendOrderConfirmationEmail(order as OrderRecord);
        } catch (err) {
          console.error("Failed to send order confirmation email:", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
