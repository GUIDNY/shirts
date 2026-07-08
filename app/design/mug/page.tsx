"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import { MUG_PRICE } from "@/lib/types";
import StickyCheckoutBar from "@/components/design/StickyCheckoutBar";

const MAX_SIZE_MB = 20;

export default function MugDesignPage() {
  const router = useRouter();
  const { setItem } = useCart();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const price = useMemo(() => calculatePrice(quantity, MUG_PRICE), [quantity]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      setError("יש להעלות קובץ תמונה מסוג PNG או JPG בלבד");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`גודל הקובץ חורג מ-${MAX_SIZE_MB}MB`);
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleContinue() {
    if (!file) {
      setError("יש להעלות תמונה קודם");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("design_front", file);
      formData.append("mockup_front", file);
      formData.append("print_front", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "העלאה נכשלה");

      setItem({
        category: "mug",
        quantity,
        imageUrl: data.imageUrl,
        printFileUrl: data.printFileUrl,
        unitPrice: MUG_PRICE,
      });

      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-[#0a0a0f] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:flex w-56 shrink-0 border-l border-white/10 flex-col gap-2 p-4">
          <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center">
            <span className="text-xl">⬆️</span>
            <span className="text-sm font-medium text-white">העלאת עיצוב לספל</span>
            <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
          </label>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-white/10 flex items-center px-4 lg:px-6 shrink-0">
            <span className="text-sm text-neutral-500">ספל בעיצוב אישי</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 md:py-12">
            <div className="lg:hidden w-full max-w-sm">
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center mb-4">
                <span className="text-xl">⬆️</span>
                <span className="text-sm font-medium text-white">העלאת עיצוב לספל</span>
                <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="rounded-2xl bg-[#141419] ring-1 ring-white/10 shadow-2xl p-6 md:p-10">
              <svg width="280" height="260" viewBox="0 0 280 260" className="drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                {/* handle */}
                <path
                  d="M215 90 C260 90, 260 170, 215 170"
                  fill="none"
                  stroke="#f5f5f0"
                  strokeWidth="16"
                />
                {/* body */}
                <rect x="55" y="55" width="160" height="150" rx="6" fill="#f5f5f0" />
                {previewUrl && (
                  <>
                    <clipPath id="mugPrintArea">
                      <rect x="75" y="90" width="120" height="90" rx="2" />
                    </clipPath>
                    <image
                      href={previewUrl}
                      x="75"
                      y="90"
                      width="120"
                      height="90"
                      preserveAspectRatio="xMidYMid slice"
                      clipPath="url(#mugPrintArea)"
                    />
                  </>
                )}
                {!previewUrl && (
                  <rect
                    x="75"
                    y="90"
                    width="120"
                    height="90"
                    fill="none"
                    stroke="rgba(0,0,0,0.2)"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

        <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-r border-white/10 p-5 flex flex-col gap-6 pb-32">
          <div>
            <h2 className="font-semibold text-white mb-2">מוצר</h2>
            <p className="text-sm text-neutral-400">ספל קרמיקה לבן 11oz (325 מ&quot;ל)</p>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">
              מחיר <span className="font-normal text-neutral-500">· פריט פרימיום</span>
            </h2>
            <p className="text-sm text-neutral-400">{MUG_PRICE} ₪ ליחידה — כולל ייצור ומשלוח לישראל</p>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">כמות</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="הפחת כמות"
                className="h-10 w-10 rounded-md border border-white/15 text-white text-lg hover:bg-white/5"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="הוסף כמות"
                className="h-10 w-10 rounded-md border border-white/15 text-white text-lg hover:bg-white/5"
              >
                +
              </button>
            </div>
          </div>
        </aside>
      </div>

      <StickyCheckoutBar price={price} submitting={submitting} onContinue={handleContinue} />
    </div>
  );
}
