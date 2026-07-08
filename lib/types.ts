export type ProductType = "men" | "women" | "kids";

/** Top-level product line. "apparel" is the existing t-shirt flow. */
export type ProductCategory = "apparel" | "poster" | "tote" | "canvas";

export type PosterPaper = "glossy" | "matte";
export type PosterOrientation = "ver" | "hor";

export const POSTER_PAPER_LABELS: Record<PosterPaper, string> = {
  glossy: "נייר משי (מבריק למחצה)",
  matte: "נייר מאט פרימיום",
};

/**
 * Single fixed size (50x70cm) — verified against the Gelato Product API
 * (catalog "posters", productUid `flat_500x700-mm-20x28-inch_...`) on
 * 2026-07-08. Prices include production + DHL Express shipping to IL with
 * a healthy margin over the real Gelato cost (glossy: 60.19₪ cost, matte:
 * 66.14₪ cost — both quoted by the user directly from their Gelato
 * dashboard, since the orders:quote API endpoint 500s on this account).
 */
export const POSTER_PRICE: Record<PosterPaper, number> = {
  glossy: 99,
  matte: 109,
};

export type ToteColor = "natural" | "black" | "navy" | "white";

export const TOTE_COLOR_LABELS: Record<ToteColor, string> = {
  natural: "טבעי",
  black: "שחור",
  navy: "נייבי",
  white: "לבן",
};

/** Fabric swatch colors — real Westford Mill canvas tones, not tinted. */
export const TOTE_COLOR_HEX: Record<ToteColor, string> = {
  natural: "#e8dfc8",
  black: "#232323",
  navy: "#22335c",
  white: "#f5f5f0",
};

/**
 * Single fixed size (standard tote, catalog "tote-bags", productUid
 * `bag_product_bsc_tote-bag_bqa_clc_bsi_std-t_bco_{color}_bpr_4-0`) —
 * verified against the Gelato Product API on 2026-07-08, plus a real
 * draft order confirming the file type ("front") and the exact cost
 * (49.94₪ production + 46.80₪ DHL express to IL = 96.74₪, matching the
 * user's own dashboard figures exactly).
 */
export const TOTE_PRICE = 149;

export type CanvasOrientation = "ver" | "hor";

/**
 * Single fixed size (50x50cm / 20x20"), catalog "canvas", productUid
 * `canvas_product_cf_20x20-inch_cm_canvas_cfrm_wood-fsc-2-cm_cl_4-0_{ver|hor}`
 * — verified against the Gelato Product API AND a real draft order on
 * 2026-07-08. The catalog has several parallel canvas product lines with
 * very different shipping weights (framed vs. simplified, 2/3/4cm frame);
 * this real order came back at 109.43₪ production + 154.76₪ DHL express to
 * IL = 264.19₪ total — noticeably higher than the user's own dashboard
 * figure for "Canvas 20x20" (106.28₪), most likely because their number
 * was for a different sub-variant. Went with this verified live number
 * rather than the table, and priced accordingly as a clear premium item.
 */
export const CANVAS_PRICE = 379;

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

export interface ApparelCartItem {
  category: "apparel";
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

export interface PosterCartItem {
  category: "poster";
  paper: PosterPaper;
  orientation: PosterOrientation;
  quantity: number;
  /** Poster prints are full-bleed — the uploaded file itself is the print file. */
  imageUrl: string;
  printFileUrl: string;
  /** Snapshot of POSTER_PRICE[paper] at add-to-cart time. */
  unitPrice: number;
}

export interface ToteCartItem {
  category: "tote";
  color: ToteColor;
  quantity: number;
  /** Same file used for both the flat preview and the print — no compositing needed. */
  imageUrl: string;
  printFileUrl: string;
  unitPrice: number;
}

export interface CanvasCartItem {
  category: "canvas";
  orientation: CanvasOrientation;
  quantity: number;
  /** Canvas prints are full-bleed — the uploaded file itself is the print file. */
  imageUrl: string;
  printFileUrl: string;
  unitPrice: number;
}

export type CartItem = ApparelCartItem | PosterCartItem | ToteCartItem | CanvasCartItem;

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
  product_category: ProductCategory;
  /** Placeholder values on poster rows (product_category === "poster") — never read. */
  product_type: ProductType;
  size: Size;
  color: ShirtColor;
  poster_paper: PosterPaper | null;
  poster_orientation: PosterOrientation | null;
  tote_color: ToteColor | null;
  canvas_orientation: CanvasOrientation | null;
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
