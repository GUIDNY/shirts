"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import {
  ALL_COLORS,
  COLOR_HEX,
  COLOR_LABELS,
  PRODUCT_LABELS,
  SIZES,
  type PrintSide,
  type ProductType,
  type ShirtColor,
  type Size,
  type DesignTransform,
} from "@/lib/types";
import type { ShirtDesignerCanvasHandle } from "@/components/ShirtDesignerCanvas";

const ShirtDesignerCanvas = dynamic(() => import("@/components/ShirtDesignerCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] h-[480px] rounded-lg border border-neutral-200 bg-neutral-50 animate-pulse" />
  ),
});

const ModelPreview = dynamic(() => import("@/components/ModelPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-[360px] h-[480px] rounded-lg border border-neutral-200 bg-neutral-50 animate-pulse" />
  ),
});

const PRODUCT_TYPES: ProductType[] = ["men", "women", "kids"];
const MAX_SIZE_MB = 20;

interface SideDesign {
  file: File | null;
  url: string | null;
  transform: DesignTransform | null;
}

const EMPTY_SIDE: SideDesign = { file: null, url: null, transform: null };

export default function DesignPage() {
  const router = useRouter();
  const { setItem } = useCart();

  const [productType, setProductType] = useState<ProductType>("men");
  const [color, setColor] = useState<ShirtColor>("white");
  const [size, setSize] = useState<Size>("M");
  const [quantity, setQuantity] = useState(1);
  const [designs, setDesigns] = useState<Record<PrintSide, SideDesign>>({
    front: EMPTY_SIDE,
    back: EMPTY_SIDE,
  });
  const [side, setSide] = useState<PrintSide>("front");
  const [view, setView] = useState<"flat" | "model">("flat");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const frontCanvasRef = useRef<ShirtDesignerCanvasHandle>(null);
  const backCanvasRef = useRef<ShirtDesignerCanvasHandle>(null);

  const price = useMemo(() => calculatePrice(quantity), [quantity]);
  const active = designs[side];

  function updateSide(s: PrintSide, patch: Partial<SideDesign>) {
    setDesigns((prev) => ({ ...prev, [s]: { ...prev[s], ...patch } }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("יש להעלות קובץ תמונה מסוג PNG או JPG בלבד");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`גודל הקובץ חורג מ-${MAX_SIZE_MB}MB`);
      return;
    }

    updateSide(side, { file, url: URL.createObjectURL(file), transform: null });
  }

  async function handleContinue() {
    setError(null);

    if (!designs.front.file || !designs.front.url) {
      setError("יש להעלות עיצוב לחזית החולצה לפני שממשיכים");
      setSide("front");
      setView("flat");
      return;
    }
    if (!frontCanvasRef.current) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("design_front", designs.front.file);
      const frontMockupBlob = await (await fetch(frontCanvasRef.current.exportMockup())).blob();
      formData.append("mockup_front", frontMockupBlob, "mockup-front.png");

      if (designs.back.file && backCanvasRef.current) {
        formData.append("design_back", designs.back.file);
        const backMockupBlob = await (await fetch(backCanvasRef.current.exportMockup())).blob();
        formData.append("mockup_back", backMockupBlob, "mockup-back.png");
      }

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "העלאה נכשלה, נסו שוב");
        return;
      }

      setItem({
        productType,
        color,
        size,
        quantity,
        imageUrl: data.imageUrl,
        mockupUrl: data.mockupUrl,
        transform: designs.front.transform as DesignTransform,
        backImageUrl: data.backImageUrl || null,
        backMockupUrl: data.backMockupUrl || null,
        backTransform: designs.back.transform || null,
      });

      router.push("/cart");
    } catch {
      setError("משהו השתבש, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  }

  const uploadLabel = side === "front" ? "העלו עיצוב לחזית" : "העלו עיצוב לגב (לא חובה)";

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">עיצוב החולצה שלך</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-1 rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="תצוגה">
            <button
              type="button"
              role="tab"
              aria-selected={view === "flat" && side === "front"}
              onClick={() => {
                setView("flat");
                setSide("front");
              }}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                view === "flat" && side === "front"
                  ? "bg-white shadow-sm text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              חזית
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "flat" && side === "back"}
              onClick={() => {
                setView("flat");
                setSide("back");
              }}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                view === "flat" && side === "back"
                  ? "bg-white shadow-sm text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              גב
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "model"}
              onClick={() => setView("model")}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                view === "model" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              על דוגמן
            </button>
          </div>

          {/* both editors stay mounted so transforms survive tab switches */}
          <div className={view === "flat" && side === "front" ? "" : "hidden"}>
            <ShirtDesignerCanvas
              ref={frontCanvasRef}
              color={color}
              side="front"
              imageUrl={designs.front.url}
              transform={designs.front.transform}
              onTransformChange={(t) => updateSide("front", { transform: t })}
            />
          </div>
          <div className={view === "flat" && side === "back" ? "" : "hidden"}>
            <ShirtDesignerCanvas
              ref={backCanvasRef}
              color={color}
              side="back"
              imageUrl={designs.back.url}
              transform={designs.back.transform}
              onTransformChange={(t) => updateSide("back", { transform: t })}
            />
          </div>
          {view === "model" && (
            <ModelPreview
              productType={productType}
              color={color}
              imageUrl={designs.front.url}
              transform={designs.front.transform}
            />
          )}

          {view === "model" ? (
            <p className="text-sm text-neutral-500">
              כך ההדפסה הקדמית תיראה במציאות — חזרו ל&quot;חזית&quot; כדי לערוך
            </p>
          ) : active.url ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-neutral-500">
                גררו את התמונה כדי להזיז, ומהפינות כדי להגדיל, להקטין או לסובב
              </p>
              <label className="text-sm font-medium text-neutral-700 underline cursor-pointer">
                החלף תמונה
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <label className="w-full max-w-[360px] flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-neutral-300 cursor-pointer hover:border-neutral-400 transition-colors text-neutral-500 text-sm">
              <span>{uploadLabel}</span>
              <span className="text-xs">PNG/JPG, עד 20MB</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold mb-2">סוג מוצר</h2>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_TYPES.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => {
                    setProductType(pt);
                    // Gelato לא מציעה XXL בגזרת ילדים
                    if (pt === "kids" && size === "XXL") setSize("XL");
                  }}
                  className={`h-11 rounded-md border text-sm font-medium transition-colors ${
                    productType === pt
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {PRODUCT_LABELS[pt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">
              צבע <span className="font-normal text-neutral-500">· {COLOR_LABELS[color]}</span>
            </h2>
            <div className="flex gap-3 flex-wrap">
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={COLOR_LABELS[c]}
                  aria-pressed={color === c}
                  style={{ backgroundColor: c === "white" ? "#f0f0f0" : COLOR_HEX[c] }}
                  className={`h-11 w-11 rounded-full border-2 transition-all ${
                    color === c ? "border-neutral-900 scale-110" : "border-neutral-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">מידה</h2>
            <div className="flex gap-2 flex-wrap">
              {SIZES.filter((s) => !(productType === "kids" && s === "XXL")).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-11 w-14 rounded-md border text-sm font-medium transition-colors ${
                    size === s
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">כמות</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-11 w-11 rounded-md border border-neutral-200 text-lg hover:bg-neutral-50"
                aria-label="הפחת כמות"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-11 w-11 rounded-md border border-neutral-200 text-lg hover:bg-neutral-50"
                aria-label="הוסף כמות"
              >
                +
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">מחיר ליחידה</span>
              <span>{price.unitPrice} ₪</span>
            </div>
            {price.discountRate > 0 && (
              <div className="flex justify-between text-green-700">
                <span>הנחת כמות</span>
                <span>-{Math.round(price.discountRate * 100)}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-600">משלוח</span>
              <span>{price.shipping === 0 ? "חינם" : `${price.shipping} ₪`}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-neutral-200">
              <span>סה&quot;כ</span>
              <span>{price.total} ₪</span>
            </div>
          </div>

          {designs.back.url && (
            <p className="text-sm text-neutral-600 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
              ✓ ההזמנה כוללת הדפסה על הגב
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={submitting}
            className="h-12 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "מעלה..." : "המשך להזמנה"}
          </button>
        </div>
      </div>
    </div>
  );
}
