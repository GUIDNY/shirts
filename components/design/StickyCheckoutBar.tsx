"use client";

import type { PriceBreakdown } from "@/lib/pricing";

interface Props {
  price: PriceBreakdown;
  submitting: boolean;
  onContinue: () => void;
}

export default function StickyCheckoutBar({ price, submitting, onContinue }: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#111116]/95 backdrop-blur-md border-t border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-neutral-500">
            {price.quantity} יח&apos; {price.discountRate > 0 && `· הנחה ${Math.round(price.discountRate * 100)}%`}
          </p>
          <p className="text-xl font-bold text-white">{price.total} ₪</p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={submitting}
          className="h-12 px-6 md:px-8 rounded-md brand-gradient-bg text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
        >
          {submitting ? "מעלה..." : "המשך להזמנה"}
        </button>
      </div>
    </div>
  );
}
