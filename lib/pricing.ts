export const UNIT_PRICE = 89;
export const SHIPPING_PRICE = 25;
export const FREE_SHIPPING_MIN_QTY = 4; // מעל 3 חולצות = 4 ומעלה

export function quantityDiscountRate(quantity: number): number {
  if (quantity >= 5) return 0.2;
  if (quantity >= 2) return 0.1;
  return 0;
}

export interface PriceBreakdown {
  unitPrice: number;
  quantity: number;
  discountRate: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export function calculatePrice(quantity: number, unitPrice: number = UNIT_PRICE): PriceBreakdown {
  const discountRate = quantityDiscountRate(quantity);
  const subtotal = Math.round(unitPrice * quantity * (1 - discountRate) * 100) / 100;
  const shipping = quantity >= FREE_SHIPPING_MIN_QTY ? 0 : SHIPPING_PRICE;
  const total = Math.round((subtotal + shipping) * 100) / 100;
  return { unitPrice, quantity, discountRate, subtotal, shipping, total };
}
