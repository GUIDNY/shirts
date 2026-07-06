import "server-only";
import { supabaseAdmin, DESIGNS_BUCKET } from "./supabase/server";
import type { OrderRecord, ProductType, ShirtColor, Size } from "./types";

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

export function getProductUid(productType: ProductType, color: ShirtColor, size: Size): string {
  if (productType === "kids" && size === "XXL") {
    throw new Error("Gelato does not offer kids t-shirts in size XXL.");
  }
  const cut = GELATO_CUT[productType];
  const gelatoColor = GELATO_COLOR[color];
  const gelatoSize = GELATO_SIZE[size];
  return `apparel_product_gca_t-shirt_gsc_crewneck_gcu_${cut}_gqa_classic_gsi_${gelatoSize}_gco_${gelatoColor}_gpr_4-0`;
}

/** Creates a short-lived signed URL so Gelato can fetch the private design file. */
async function getSignedDesignUrl(imagePath: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(DESIGNS_BUCKET)
    .createSignedUrl(imagePath, 60 * 60 * 24); // 24h, enough for Gelato to fetch it

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL for design file: ${error?.message}`);
  }
  return data.signedUrl;
}

export interface GelatoOrderResponse {
  id: string;
  orderReferenceId: string;
  orderType: string;
  fulfillmentStatus: string;
  [key: string]: unknown;
}

/**
 * Creates an order on Gelato for a paid, internal order.
 * Only call this AFTER payment has been confirmed (paymentStatus === "paid").
 *
 * Gelato Order API v4 reference: https://dashboard.gelato.com/docs/orders/v4/create/
 */
export async function createGelatoOrder(order: OrderRecord): Promise<GelatoOrderResponse> {
  if (!GELATO_API_KEY) {
    throw new Error("GELATO_API_KEY is not set in environment variables.");
  }
  if (order.payment_status !== "paid") {
    throw new Error("Refusing to send an unpaid order to Gelato.");
  }

  const productUid = getProductUid(order.product_type, order.color, order.size);
  const designFileUrl = await getSignedDesignUrl(order.image_path);

  const body = {
    orderType: "order",
    orderReferenceId: order.id,
    customerReferenceId: order.email,
    currency: "ILS",
    items: [
      {
        itemReferenceId: `${order.id}-item-1`,
        productUid,
        files: [
          {
            type: GELATO_PRINT_AREA,
            url: designFileUrl,
          },
        ],
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

/** Shape of the payload Gelato posts to our webhook on fulfillment status changes. */
export interface GelatoWebhookPayload {
  event: string;
  orderId: string;
  orderReferenceId?: string;
  fulfillmentStatus?: string;
  [key: string]: unknown;
}
