"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import { COLOR_LABELS, POSTER_PAPER_LABELS, PRODUCT_LABELS } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { item, updateQuantity, hydrated } = useCart();

  if (!hydrated) return null;

  if (!item) {
    return (
      <div className="max-w-[720px] mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">הסל שלך ריק</h1>
        <p className="text-neutral-600 mb-8">עדיין לא עיצבתם חולצה. בואו נתחיל!</p>
        <Link
          href="/design"
          className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          התחל לעצב
        </Link>
      </div>
    );
  }

  const price = item.category === "poster" ? calculatePrice(item.quantity, item.unitPrice) : calculatePrice(item.quantity);

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">סל קניות</h1>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 border border-neutral-200 rounded-lg p-5">
        <div className="flex flex-col gap-2">
          <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-neutral-50">
            <Image
              src={item.category === "poster" ? item.imageUrl : item.mockupUrl}
              alt={item.category === "poster" ? "תצוגה מקדימה של הפוסטר" : "תצוגה מקדימה של החולצה"}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          {item.category === "apparel" && item.backMockupUrl && (
            <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-neutral-50">
              <Image src={item.backMockupUrl} alt="תצוגה מקדימה של גב החולצה" fill className="object-contain" unoptimized />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {item.category === "poster" ? (
            <>
              <h2 className="text-lg font-semibold">פוסטר בעיצוב אישי</h2>
              <dl className="grid grid-cols-2 gap-y-1 text-sm text-neutral-700 max-w-xs">
                <dt className="text-neutral-500">נייר</dt>
                <dd>{POSTER_PAPER_LABELS[item.paper]}</dd>
                <dt className="text-neutral-500">גודל</dt>
                <dd>50×70 ס&quot;מ</dd>
              </dl>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold">{PRODUCT_LABELS[item.productType]}</h2>
              <dl className="grid grid-cols-2 gap-y-1 text-sm text-neutral-700 max-w-xs">
                <dt className="text-neutral-500">צבע</dt>
                <dd>{COLOR_LABELS[item.color]}</dd>
                <dt className="text-neutral-500">מידה</dt>
                <dd>{item.size}</dd>
                {item.backMockupUrl && (
                  <>
                    <dt className="text-neutral-500">הדפסה</dt>
                    <dd>חזית + גב</dd>
                  </>
                )}
              </dl>
            </>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-neutral-500">כמות</span>
            <button
              type="button"
              onClick={() => updateQuantity(Math.max(1, item.quantity - 1))}
              className="h-9 w-9 rounded-md border border-neutral-200 text-lg hover:bg-neutral-50"
              aria-label="הפחת כמות"
            >
              −
            </button>
            <span className="w-6 text-center font-medium">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.quantity + 1)}
              className="h-9 w-9 rounded-md border border-neutral-200 text-lg hover:bg-neutral-50"
              aria-label="הוסף כמות"
            >
              +
            </button>
          </div>

          <Link
            href={item.category === "poster" ? "/design/poster" : "/design"}
            className="text-sm text-neutral-500 underline w-fit mt-1"
          >
            עריכת העיצוב
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-neutral-50 border border-neutral-200 p-5 max-w-sm mr-auto text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">
            {item.quantity} × {price.unitPrice} ₪
          </span>
          <span>{Math.round(price.unitPrice * item.quantity * 100) / 100} ₪</span>
        </div>
        {price.discountRate > 0 && (
          <div className="flex justify-between text-green-700">
            <span>הנחת כמות ({Math.round(price.discountRate * 100)}%)</span>
            <span>
              -{Math.round(price.unitPrice * item.quantity * price.discountRate * 100) / 100} ₪
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-neutral-600">משלוח לישראל</span>
          <span>{price.shipping === 0 ? "חינם" : `${price.shipping} ₪`}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-neutral-200">
          <span>סה&quot;כ לתשלום</span>
          <span>{price.total} ₪</span>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="h-12 px-8 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
        >
          המשך לפרטי משלוח
        </button>
      </div>
    </div>
  );
}
