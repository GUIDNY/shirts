import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createGelatoOrder } from "@/lib/gelato";
import type { OrderRecord } from "@/lib/types";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ error: "חסר מזהה הזמנה" }, { status: 400 });
  }

  const { data: order, error: fetchError } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single<OrderRecord>();

  if (fetchError || !order) {
    return NextResponse.json({ error: "ההזמנה לא נמצאה" }, { status: 404 });
  }

  if (order.payment_status !== "paid") {
    return NextResponse.json({ error: "לא ניתן לשלוח הזמנה שלא שולמה" }, { status: 400 });
  }

  if (order.gelato_order_id) {
    return NextResponse.json({ error: "ההזמנה כבר נשלחה ל-Gelato" }, { status: 400 });
  }

  try {
    const gelatoOrder = await createGelatoOrder(order);

    await getSupabaseAdmin()
      .from("orders")
      .update({ gelato_order_id: gelatoOrder.id, order_status: "sent_to_gelato" })
      .eq("id", orderId);

    return NextResponse.json({ ok: true, gelatoOrderId: gelatoOrder.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "שליחה ל-Gelato נכשלה" },
      { status: 500 }
    );
  }
}
