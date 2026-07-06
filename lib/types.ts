export type ProductType = "men" | "women" | "kids";

export type ShirtColor = "white" | "black" | "blue";

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
  blue: "כחול",
};

export const COLOR_HEX: Record<ShirtColor, string> = {
  white: "#f5f5f5",
  black: "#1a1a1a",
  blue: "#1e3a8a",
};

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
  imagePath: string;
  mockupPath: string;
  imageUrl: string;
  mockupUrl: string;
  transform: DesignTransform;
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
  image_path: string;
  mockup_path: string;
  price: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  gelato_order_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
}
