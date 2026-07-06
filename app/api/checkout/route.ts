import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { calculatePrice } from "@/lib/pricing";
import {
  COLOR_LABELS,
  PRODUCT_LABELS,
  SIZES,
  type CartItem,
  type CustomerDetails,
} from "@/lib/types";

const VALID_PRODUCT_TYPES = ["men", "women", "kids"];
const VALID_COLORS = ["white", "black", "blue"];

export async function POST(request: Request) {
  const body = await request.json();
  const item = body.item as CartItem;
  const customer = body.customer as CustomerDetails;

  if (
    !item ||
    !customer ||
    !VALID_PRODUCT_TYPES.includes(item.productType) ||
    !VALID_COLORS.includes(item.color) ||
    !SIZES.includes(item.size) ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    !item.imagePath ||
    !item.mockupPath
  ) {
    return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
  }

  if (item.productType === "kids" && item.size === "XXL") {
    return NextResponse.json({ error: "חולצות ילדים אינן זמינות במידה XXL" }, { status: 400 });
  }

  if (
    !customer.customerName ||
    !customer.phone ||
    !customer.email ||
    !customer.address ||
    !customer.city ||
    !customer.zip
  ) {
    return NextResponse.json({ error: "נא למלא את כל פרטי המשלוח" }, { status: 400 });
  }

  const price = calculatePrice(item.quantity);

  const { data: order, error: insertError } = await getSupabaseAdmin()
    .from("orders")
    .insert({
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
      notes: customer.notes || null,
      product_type: item.productType,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      image_path: item.imagePath,
      mockup_path: item.mockupPath,
      price: price.total,
      payment_status: "pending",
    })
    .select()
    .single();

  if (insertError || !order) {
    return NextResponse.json(
      { error: `יצירת ההזמנה נכשלה: ${insertError?.message}` },
      { status: 500 }
    );
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const description = `${PRODUCT_LABELS[item.productType as keyof typeof PRODUCT_LABELS]} · ${
    COLOR_LABELS[item.color as keyof typeof COLOR_LABELS]
  } · מידה ${item.size} · כמות ${item.quantity}`;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: order.id,
      customer_email: customer.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "ils",
            unit_amount: Math.round(price.total * 100),
            product_data: {
              name: "הזמנת חולצה בעיצוב אישי",
              description,
            },
          },
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${origin}/thank-you/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    await getSupabaseAdmin().from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: `יצירת התשלום נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
      { status: 500 }
    );
  }
}
