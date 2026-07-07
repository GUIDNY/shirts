export type ProductType = "men" | "women" | "kids";

export type ShirtColor = "white" | "black" | "blue" | "red" | "royal" | "pink";

export type PrintSide = "front" | "back";

export type Size = "S" | "M" | "L" | "XL" | "XXL";

export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderStatus =
  | "received"
  | "paid"
  | "sent_to_gelato"
  | "printing"
  | "shipped"
  | "completed";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "התקבלה",
  paid: "שולם",
  sent_to_gelato: "נשלח ל-Gelato",
  printing: "בהדפסה",
  shipped: "נשלח",
  completed: "הושלם",
};

export const PRODUCT_LABELS: Record<ProductType, string> = {
  men: "חולצת גברים",
  women: "חולצת נשים",
  kids: "חולצת ילדים",
};

export const COLOR_LABELS: Record<ShirtColor, string> = {
  white: "לבן",
  black: "שחור",
  blue: "נייבי",
  red: "אדום",
  royal: "כחול רויאל",
  pink: "ורוד",
};

/**
 * Garment tint colors. Applied as a multiply blend over the white studio
 * photos, so they should approximate the real Gildan fabric colors.
 * "white" is a no-op tint by design.
 */
export const COLOR_HEX: Record<ShirtColor, string> = {
  white: "#ffffff",
  black: "#2b2b2b",
  blue: "#22335c",
  red: "#c0272d",
  royal: "#1d4f91",
  pink: "#f48ca4",
};

export const ALL_COLORS: ShirtColor[] = ["white", "black", "blue", "red", "royal", "pink"];

export const SIZES: Size[] = ["S", "M", "L", "XL", "XXL"];

export interface DesignTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface CartItem {
  productType: ProductType;
  color: ShirtColor;
  size: Size;
  quantity: number;
  /** Public Blob URL of the original front design file, as uploaded (admin reference only). */
  imageUrl: string;
  /** Public Blob URL of the rendered front mockup. */
  mockupUrl: string;
  /** Public Blob URL of the print-ready front file — artwork pre-composited at the
   *  exact position/scale/rotation the customer chose. This, not imageUrl, is what
   *  gets sent to Gelato. */
  printFileUrl: string;
  transform: DesignTransform;
  /** Optional back print. All back fields are set together or not at all. */
  backImageUrl?: string | null;
  backMockupUrl?: string | null;
  backPrintFileUrl?: string | null;
  backTransform?: DesignTransform | null;
}

export interface CustomerDetails {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  notes: string;
}

export interface OrderRecord {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  notes: string | null;
  product_type: ProductType;
  size: Size;
  color: ShirtColor;
  quantity: number;
  image_url: string;
  mockup_url: string;
  print_file_url: string | null;
  back_image_url: string | null;
  back_mockup_url: string | null;
  back_print_file_url: string | null;
  price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  gelato_order_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}
