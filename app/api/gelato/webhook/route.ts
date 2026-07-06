import { NextResponse } from "next/server";
import { updateOrder, updateOrderByGelatoId } from "@/lib/db";
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

  if (!nextStatus) {
    return NextResponse.json({ received: true, ignored: payload.fulfillmentStatus });
  }

  try {
    if (orderReferenceId) {
      await updateOrder(orderReferenceId, { order_status: nextStatus });
    } else {
      await updateOrderByGelatoId(gelatoOrderId, { order_status: nextStatus });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 500 }
    );
  }
}
