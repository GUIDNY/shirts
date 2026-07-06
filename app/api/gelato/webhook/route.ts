import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { GelatoWebhookPayload } from "@/lib/gelato";
import type { OrderStatus } from "@/lib/types";

/**
 * Maps Gelato's fulfillment status vocabulary to our internal order_status.
 * ⚠️ Verify these against your Gelato dashboard / API docs — the exact set
 * of fulfillmentStatus values isn't in the introductory docs this project
 * was scaffolded from, so this is a best-effort mapping. Adjust as needed.
 */
function mapFulfillmentStatus(status: string | undefined): OrderStatus | null {
  switch (status) {
    case "created":
    case "passed":
    case "in_production":
    case "printing":
      return "printing";
    case "shipped":
      return "shipped";
    case "delivered":
      return "completed";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  // ⚠️ PLACEHOLDER: if Gelato signs webhook payloads (e.g. a shared secret
  // header configured in your dashboard), verify it here before trusting
  // the body. Check your Gelato webhook settings for the exact mechanism.
  const payload = (await request.json()) as GelatoWebhookPayload;

  const orderReferenceId = payload.orderReferenceId;
  const gelatoOrderId = payload.orderId;
  const nextStatus = mapFulfillmentStatus(payload.fulfillmentStatus);

  if (!orderReferenceId && !gelatoOrderId) {
    return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
  }

  const query = supabaseAdmin.from("orders").update(
    nextStatus ? { order_status: nextStatus } : {}
  );

  const { error } = orderReferenceId
    ? await query.eq("id", orderReferenceId)
    : await query.eq("gelato_order_id", gelatoOrderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
