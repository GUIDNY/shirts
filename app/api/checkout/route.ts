import { NextResponse } from "next/server";
import { insertOrder, updateOrder } from "@/lib/db";
import { createGelatoOrder } from "@/lib/gelato";
import { getStripe } from "@/lib/stripe";
import { calculatePrice } from "@/lib/pricing";
import {
  ALL_COLORS,
  CANVAS_PRICE,
  COLOR_LABELS,
  POSTER_PAPER_LABELS,
  POSTER_PRICE,
  PRODUCT_LABELS,
  SIZES,
  TOTE_COLOR_LABELS,
  TOTE_PRICE,
  type CartItem,
  type CustomerDetails,
  type PosterPaper,
  type ToteColor,
} from "@/lib/types";

const VALID_PRODUCT_TYPES = ["men", "women", "kids"];
const VALID_POSTER_PAPERS = ["glossy", "matte"];
const VALID_POSTER_ORIENTATIONS = ["ver", "hor"];
const VALID_TOTE_COLORS = ["natural", "black", "navy", "white"];
const VALID_CANVAS_ORIENTATIONS = ["ver", "hor"];

function isBlobUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = body.item as CartItem;
  const customer = body.customer as CustomerDetails;

  if (!item || !customer || !Number.isInteger(item.quantity) || item.quantity < 1) {
    return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
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

  let price;
  let description: string;
  let newOrderFields: Parameters<typeof insertOrder>[0];

  if (item.category === "poster") {
    if (
      !VALID_POSTER_PAPERS.includes(item.paper) ||
      !VALID_POSTER_ORIENTATIONS.includes(item.orientation) ||
      !isBlobUrl(item.imageUrl) ||
      !isBlobUrl(item.printFileUrl)
    ) {
      return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
    }

    price = calculatePrice(item.quantity, POSTER_PRICE[item.paper as PosterPaper]);
    description = `פוסטר · ${POSTER_PAPER_LABELS[item.paper]} · כמות ${item.quantity}`;
    newOrderFields = {
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
      notes: customer.notes || null,
      product_category: "poster",
      product_type: "men",
      size: "M",
      color: "white",
      poster_paper: item.paper,
      poster_orientation: item.orientation,
      tote_color: null,
      canvas_orientation: null,
      quantity: item.quantity,
      image_url: item.imageUrl,
      mockup_url: item.imageUrl,
      print_file_url: item.printFileUrl,
      back_image_url: null,
      back_mockup_url: null,
      back_print_file_url: null,
      price: price.total,
    };
  } else if (item.category === "tote") {
    if (!VALID_TOTE_COLORS.includes(item.color) || !isBlobUrl(item.imageUrl) || !isBlobUrl(item.printFileUrl)) {
      return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
    }

    price = calculatePrice(item.quantity, TOTE_PRICE);
    description = `טוט בג · ${TOTE_COLOR_LABELS[item.color]} · כמות ${item.quantity}`;
    newOrderFields = {
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
      notes: customer.notes || null,
      product_category: "tote",
      product_type: "men",
      size: "M",
      color: "white",
      poster_paper: null,
      poster_orientation: null,
      tote_color: item.color as ToteColor,
      canvas_orientation: null,
      quantity: item.quantity,
      image_url: item.imageUrl,
      mockup_url: item.imageUrl,
      print_file_url: item.printFileUrl,
      back_image_url: null,
      back_mockup_url: null,
      back_print_file_url: null,
      price: price.total,
    };
  } else if (item.category === "canvas") {
    if (!VALID_CANVAS_ORIENTATIONS.includes(item.orientation) || !isBlobUrl(item.imageUrl) || !isBlobUrl(item.printFileUrl)) {
      return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
    }

    price = calculatePrice(item.quantity, CANVAS_PRICE);
    description = `קנבס 50×50 · כמות ${item.quantity}`;
    newOrderFields = {
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
      notes: customer.notes || null,
      product_category: "canvas",
      product_type: "men",
      size: "M",
      color: "white",
      poster_paper: null,
      poster_orientation: null,
      tote_color: null,
      canvas_orientation: item.orientation,
      quantity: item.quantity,
      image_url: item.imageUrl,
      mockup_url: item.imageUrl,
      print_file_url: item.printFileUrl,
      back_image_url: null,
      back_mockup_url: null,
      back_print_file_url: null,
      price: price.total,
    };
  } else {
    if (
      !VALID_PRODUCT_TYPES.includes(item.productType) ||
      !ALL_COLORS.includes(item.color) ||
      !SIZES.includes(item.size) ||
      !isBlobUrl(item.imageUrl) ||
      !isBlobUrl(item.mockupUrl) ||
      !isBlobUrl(item.printFileUrl)
    ) {
      return NextResponse.json({ error: "נתוני ההזמנה אינם תקינים" }, { status: 400 });
    }

    const hasBack = Boolean(item.backImageUrl || item.backMockupUrl);
    if (
      hasBack &&
      (!isBlobUrl(item.backImageUrl ?? "") ||
        !isBlobUrl(item.backMockupUrl ?? "") ||
        !isBlobUrl(item.backPrintFileUrl ?? ""))
    ) {
      return NextResponse.json({ error: "נתוני הדפסת הגב אינם תקינים" }, { status: 400 });
    }

    if (item.productType === "kids" && item.size === "XXL") {
      return NextResponse.json({ error: "חולצות ילדים אינן זמינות במידה XXL" }, { status: 400 });
    }

    price = calculatePrice(item.quantity);
    description = `${PRODUCT_LABELS[item.productType]} · ${COLOR_LABELS[item.color]} · מידה ${item.size} · כמות ${item.quantity}`;
    newOrderFields = {
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
      notes: customer.notes || null,
      product_category: "apparel",
      product_type: item.productType,
      size: item.size,
      color: item.color,
      poster_paper: null,
      poster_orientation: null,
      tote_color: null,
      canvas_orientation: null,
      quantity: item.quantity,
      image_url: item.imageUrl,
      mockup_url: item.mockupUrl,
      print_file_url: item.printFileUrl,
      back_image_url: hasBack ? (item.backImageUrl as string) : null,
      back_mockup_url: hasBack ? (item.backMockupUrl as string) : null,
      back_print_file_url: hasBack ? (item.backPrintFileUrl as string) : null,
      price: price.total,
    };
  }

  let order;
  try {
    order = await insertOrder(newOrderFields);
  } catch (err) {
    return NextResponse.json(
      { error: `יצירת ההזמנה נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
      { status: 500 }
    );
  }

  // Create a Gelato DRAFT immediately — it shows up in the Gelato dashboard,
  // but nothing is charged or printed until it's explicitly converted.
  try {
    const gelatoDraft = await createGelatoOrder(order, "draft");
    order = (await updateOrder(order.id, { gelato_order_id: gelatoDraft.id })) ?? order;
  } catch (err) {
    // The internal order still exists; the draft can be retried from admin.
    console.error("Failed to create Gelato draft for order", order.id, err);
  }

  // If Stripe is configured, continue to hosted checkout; otherwise finish
  // the order immediately (no-payment mode until Stripe keys are added).
  if (process.env.STRIPE_SECRET_KEY) {
    const origin = request.headers.get("origin") || new URL(request.url).origin;

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
                name:
                  item.category === "poster"
                    ? "הזמנת פוסטר בעיצוב אישי"
                    : item.category === "tote"
                      ? "הזמנת טוט בג בעיצוב אישי"
                      : item.category === "canvas"
                        ? "הזמנת קנבס בעיצוב אישי"
                        : "הזמנת חולצה בעיצוב אישי",
                description,
              },
            },
          },
        ],
        metadata: { orderId: order.id },
        success_url: `${origin}/thank-you/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
      });

      await updateOrder(order.id, { stripe_session_id: session.id });

      return NextResponse.json({ url: session.url });
    } catch (err) {
      return NextResponse.json(
        { error: `יצירת התשלום נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ orderId: order.id });
}
