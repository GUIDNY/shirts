import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";
import { getOrderById, updateOrder } from "@/lib/db";
import { convertGelatoDraftToOrder, createGelatoOrder } from "@/lib/gelato";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await verifyAdminSessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, action } = await request.json();
  if (!orderId || !["create_draft", "convert"].includes(action)) {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "ההזמנה לא נמצאה" }, { status: 404 });
  }

  try {
    if (action === "create_draft") {
      if (order.gelato_order_id) {
        return NextResponse.json({ error: "דראפט כבר קיים להזמנה זו" }, { status: 400 });
      }
      const draft = await createGelatoOrder(order, "draft");
      await updateOrder(orderId, { gelato_order_id: draft.id });
      return NextResponse.json({ ok: true, gelatoOrderId: draft.id });
    }

    // convert draft → production order
    if (!order.gelato_order_id) {
      return NextResponse.json({ error: "אין דראפט להזמנה זו — צרו דראפט קודם" }, { status: 400 });
    }
    await convertGelatoDraftToOrder(order.gelato_order_id);
    await updateOrder(orderId, { order_status: "sent_to_gelato" });
    return NextResponse.json({ ok: true, gelatoOrderId: order.gelato_order_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "הפעולה נכשלה" },
      { status: 500 }
    );
  }
}
