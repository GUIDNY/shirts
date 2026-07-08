"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import { POSTER_PAPER_LABELS, POSTER_PRICE, type PosterOrientation, type PosterPaper } from "@/lib/types";
import StickyCheckoutBar from "@/components/design/StickyCheckoutBar";

const MAX_SIZE_MB = 20;
const PAPERS: PosterPaper[] = ["glossy", "matte"];

export default function PosterDesignPage() {
  const router = useRouter();
  const { setItem } = useCart();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<PosterOrientation>("ver");
  const [paper, setPaper] = useState<PosterPaper>("glossy");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const price = useMemo(() => calculatePrice(quantity, POSTER_PRICE[paper]), [quantity, paper]);

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
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => setOrientation(img.width >= img.height ? "hor" : "ver");
    img.src = url;
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
      // Posters are full-bleed — the design file itself doubles as the
      // mockup and print file, so we upload it once and the API reuses
      // that URL for all three (sending it 3x would triple the payload
      // and can exceed the platform's request body size limit).
      formData.append("design_front", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "העלאה נכשלה");

      setItem({
        category: "poster",
        paper,
        orientation,
        quantity,
        imageUrl: data.imageUrl,
        printFileUrl: data.printFileUrl,
        unitPrice: POSTER_PRICE[paper],
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
            <span className="text-sm font-medium text-white">העלאת תמונה לפוסטר</span>
            <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
          </label>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-white/10 flex items-center px-4 lg:px-6 shrink-0">
            <span className="text-sm text-neutral-500">פוסטר בעיצוב אישי</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 md:py-12">
            <div className="lg:hidden w-full max-w-sm">
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center mb-4">
                <span className="text-xl">⬆️</span>
                <span className="text-sm font-medium text-white">העלאת תמונה לפוסטר</span>
                <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="rounded-2xl bg-[#141419] ring-1 ring-white/10 shadow-2xl p-6 md:p-10">
              {previewUrl ? (
                <div
                  className={`relative bg-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${
                    orientation === "ver" ? "w-[240px] aspect-[5/7]" : "w-[340px] aspect-[7/5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="תצוגת הפוסטר" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-[240px] aspect-[5/7] rounded-md border-2 border-dashed border-white/15 flex items-center justify-center text-center px-4">
                  <p className="text-sm text-neutral-500">העלו תמונה כדי לראות תצוגה מקדימה</p>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

        <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-r border-white/10 p-5 flex flex-col gap-6 pb-32">
          <div>
            <h2 className="font-semibold text-white mb-2">
              נייר <span className="font-normal text-neutral-500">· {POSTER_PAPER_LABELS[paper]}</span>
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {PAPERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaper(p)}
                  className={`h-14 rounded-md border text-sm font-medium px-4 flex items-center justify-between transition-colors ${
                    paper === p
                      ? "brand-gradient-bg border-transparent text-white"
                      : "border-white/15 text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <span>{POSTER_PAPER_LABELS[p]}</span>
                  <span className="tabular-nums">{POSTER_PRICE[p]} ₪</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">גודל</h2>
            <p className="text-sm text-neutral-400">50×70 ס&quot;מ — מתאים לתלייה על קיר</p>
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
