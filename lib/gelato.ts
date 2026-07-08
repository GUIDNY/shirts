import "server-only";
import type { OrderRecord, PosterOrientation, PosterPaper, ProductType, ShirtColor, Size } from "./types";

const GELATO_API_BASE = "https://order.gelatoapis.com";
const GELATO_API_KEY = process.env.GELATO_API_KEY;

/**
 * Gelato encodes the full variant (cut, quality, size, color, print areas)
 * inside the productUid. These were verified live against the Gelato
 * Product API (catalog "t-shirts") on 2026-07-06 — every cut/color/size
 * combination this shop sells returned 200 from
 * GET https://product.gelatoapis.com/v3/products/{productUid},
 * except kids XXL which Gelato does not offer (the UI blocks it too).
 *
 * "gpr_4-0" = full-color front print, no back print.
 */
const GELATO_CUT: Record<ProductType, string> = {
  men: "unisex",
  women: "womens",
  kids: "kids",
};

const GELATO_COLOR: Record<ShirtColor, string> = {
  white: "white",
  black: "black",
  blue: "navy",
  red: "red",
  royal: "royal",
  pink: "azalea",
};

const GELATO_SIZE: Record<Size, string> = {
  S: "s",
  M: "m",
  L: "l",
  XL: "xl",
  XXL: "2xl",
};

/** Print area for the design file. "front" is the front print area for apparel. */
const GELATO_PRINT_AREA = "front";

/**
 * Shipping to IL, verified via orders:quote on 2026-07-06: DHL Express
 * Worldwide DDU (39.83 ILS, 4-8 days) was both cheaper and faster than
 * DHL Global Parcel (135.34 ILS, 11-18 days), so "express" is the default.
 * Override with GELATO_SHIPMENT_METHOD if Gelato's pricing changes.
 */
const GELATO_SHIPMENT_METHOD = process.env.GELATO_SHIPMENT_METHOD || "express";

export function getProductUid(
  productType: ProductType,
  color: ShirtColor,
  size: Size,
  hasBackPrint: boolean
): string {
  if (productType === "kids" && size === "XXL") {
    throw new Error("Gelato does not offer kids t-shirts in size XXL.");
  }
  const cut = GELATO_CUT[productType];
  const gelatoColor = GELATO_COLOR[color];
  const gelatoSize = GELATO_SIZE[size];
  // "4-0" = full-color front print only; "4-4" = full-color front + back.
  const gpr = hasBackPrint ? "4-4" : "4-0";
  return `apparel_product_gca_t-shirt_gsc_crewneck_gcu_${cut}_gqa_classic_gsi_${gelatoSize}_gco_${gelatoColor}_gpr_${gpr}`;
}

const GELATO_POSTER_PAPER: Record<PosterPaper, string> = {
  glossy: "170-gsm-65lb-coated-silk",
  matte: "170-gsm-65lb-uncoated",
};

/**
 * Fixed 50x70cm poster, both orientations and both paper stocks verified
 * against the Gelato Product API (catalog "posters") on 2026-07-08.
 */
export function getPosterProductUid(paper: PosterPaper, orientation: PosterOrientation): string {
  return `flat_500x700-mm-20x28-inch_${GELATO_POSTER_PAPER[paper]}_4-0_${orientation}`;
}

export interface GelatoOrderResponse {
  id: string;
  orderReferenceId: string;
  orderType: string;
  fulfillmentStatus: string;
  [key: string]: unknown;
}

/**
 * Creates an order on Gelato.
 *
 * By default creates a DRAFT: it appears in the Gelato dashboard but is
 * never charged or sent to production until explicitly converted. Pass
 * orderType "order" only for confirmed production orders.
 *
 * Gelato Order API v4 reference: https://dashboard.gelato.com/docs/orders/v4/create/
 */
export async function createGelatoOrder(
  order: OrderRecord,
  orderType: "draft" | "order" = "draft"
): Promise<GelatoOrderResponse> {
  if (!GELATO_API_KEY) {
    throw new Error("GELATO_API_KEY is not set in environment variables.");
  }
  if (orderType === "order" && order.payment_status !== "paid") {
    throw new Error("Refusing to send an unpaid order to Gelato production.");
  }

  let productUid: string;
  const files: { type: string; url: string }[] = [];

  if (order.product_category === "poster") {
    productUid = getPosterProductUid(
      order.poster_paper as PosterPaper,
      order.poster_orientation as PosterOrientation
    );
    // Posters are full-bleed single-sided prints — file type "default".
    files.push({ type: "default", url: order.print_file_url || order.image_url });
  } else {
    const hasBackPrint = Boolean(order.back_image_url);
    productUid = getProductUid(order.product_type, order.color, order.size, hasBackPrint);

    // Send the pre-composited print file (artwork already positioned/scaled/
    // rotated exactly as the customer placed it) — never the raw upload,
    // which Gelato would just center on its own with no knowledge of our
    // editor's transform. Falls back to the raw file only for pre-migration
    // orders that don't have a print file on record.
    files.push({ type: GELATO_PRINT_AREA, url: order.print_file_url || order.image_url });
    if (hasBackPrint) {
      files.push({ type: "back", url: order.back_print_file_url || (order.back_image_url as string) });
    }
  }

  const body = {
    orderType,
    orderReferenceId: order.id,
    customerReferenceId: order.email,
    currency: "ILS",
    items: [
      {
        itemReferenceId: `${order.id}-item-1`,
        productUid,
        files,
        quantity: order.quantity,
      },
    ],
    shipmentMethodUid: GELATO_SHIPMENT_METHOD,
    shippingAddress: {
      firstName: order.customer_name.split(" ")[0] || order.customer_name,
      lastName: order.customer_name.split(" ").slice(1).join(" ") || "-",
      addressLine1: order.address,
      city: order.city,
      postCode: order.zip,
      country: "IL",
      email: order.email,
      phone: order.phone,
    },
  };

  const res = await fetch(`${GELATO_API_BASE}/v4/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": GELATO_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Gelato order creation failed (${res.status}): ${JSON.stringify(data)}`
    );
  }

  return data as GelatoOrderResponse;
}

/**
 * Converts an existing Gelato draft into a real production order.
 * This is the point of no return — Gelato will charge and print.
 */
export async function convertGelatoDraftToOrder(gelatoOrderId: string): Promise<GelatoOrderResponse> {
  if (!GELATO_API_KEY) {
    throw new Error("GELATO_API_KEY is not set in environment variables.");
  }

  const res = await fetch(`${GELATO_API_BASE}/v4/orders/${gelatoOrderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": GELATO_API_KEY,
    },
    body: JSON.stringify({ orderType: "order" }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Gelato draft conversion failed (${res.status}): ${JSON.stringify(data)}`);
  }

  return data as GelatoOrderResponse;
}

/** Shape of the payload Gelato posts to our webhook on fulfillment status changes. */
export interface GelatoWebhookPayload {
  event: string;
  orderId: string;
  orderReferenceId?: string;
  fulfillmentStatus?: string;
  [key: string]: unknown;
}
