"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import { TOTE_COLOR_HEX, TOTE_COLOR_LABELS, TOTE_PRICE, type ToteColor } from "@/lib/types";
import StickyCheckoutBar from "@/components/design/StickyCheckoutBar";

const MAX_SIZE_MB = 20;
const COLORS: ToteColor[] = ["natural", "black", "navy", "white"];

/**
 * Print area as fractions of the base tote photo (1200x800,
 * public/studio/tote-blank.jpg — a free-to-use Unsplash product shot,
 * natural canvas tote hanging flat, front panel fully visible), measured
 * directly against the image on 2026-07-13. Only used for "natural" —
 * the photo has one real color, so other colors fall back to the SVG
 * (which can be tinted to anything).
 */
const PRINT_AREA = { left: 0.392, top: 0.4, width: 0.225, height: 0.3 };

export default function ToteDesignPage() {
  const router = useRouter();
  const { setItem } = useCart();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [color, setColor] = useState<ToteColor>("natural");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const price = useMemo(() => calculatePrice(quantity, TOTE_PRICE), [quantity]);

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
      // Uploaded directly browser-to-Blob (not through a route handler)
      // so a real phone photo's size is never limited by the platform's
      // serverless function body cap.
      const ext = file.type === "image/png" ? "png" : "jpg";
      const blob = await upload(`designs/${crypto.randomUUID()}-front.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });

      setItem({
        category: "tote",
        color,
        quantity,
        imageUrl: blob.url,
        printFileUrl: blob.url,
        unitPrice: TOTE_PRICE,
      });

      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  }

  const bagFill = TOTE_COLOR_HEX[color];
  const isDark = color === "black" || color === "navy";

  return (
    <div className="bg-[#0a0a0f] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden lg:flex w-56 shrink-0 border-l border-white/10 flex-col gap-2 p-4">
          <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center">
            <span className="text-xl">⬆️</span>
            <span className="text-sm font-medium text-white">העלאת עיצוב לטוט</span>
            <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
          </label>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-white/10 flex items-center px-4 lg:px-6 shrink-0">
            <span className="text-sm text-neutral-500">טוט בג בעיצוב אישי</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 md:py-12">
            <div className="lg:hidden w-full max-w-sm">
              <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center mb-4">
                <span className="text-xl">⬆️</span>
                <span className="text-sm font-medium text-white">העלאת עיצוב לטוט</span>
                <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div className="rounded-2xl bg-[#141419] ring-1 ring-white/10 shadow-2xl p-6 md:p-10">
              {color === "natural" ? (
                <div className="relative w-[320px] aspect-[3/2] rounded-lg overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                  <Image src="/studio/tote-blank.jpg" alt="טוט בג טבעי" fill className="object-cover" sizes="320px" />
                  {previewUrl ? (
                    <div
                      className="absolute overflow-hidden"
                      style={{
                        left: `${PRINT_AREA.left * 100}%`,
                        top: `${PRINT_AREA.top * 100}%`,
                        width: `${PRINT_AREA.width * 100}%`,
                        height: `${PRINT_AREA.height * 100}%`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="עיצוב" className="absolute inset-0 w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 100%)",
                          mixBlendMode: "multiply",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="absolute border-2 border-dashed border-black/20 rounded-sm"
                      style={{
                        left: `${PRINT_AREA.left * 100}%`,
                        top: `${PRINT_AREA.top * 100}%`,
                        width: `${PRINT_AREA.width * 100}%`,
                        height: `${PRINT_AREA.height * 100}%`,
                      }}
                    />
                  )}
                </div>
              ) : (
                <svg
                  width="280"
                  height="320"
                  viewBox="0 0 280 320"
                  className="drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                >
                  {/* handles */}
                  <path
                    d="M85 90 C85 40, 115 15, 140 15 C165 15, 195 40, 195 90"
                    fill="none"
                    stroke={bagFill}
                    strokeWidth="10"
                  />
                  {/* body */}
                  <path d="M50 90 L230 90 L215 300 L65 300 Z" fill={bagFill} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  {previewUrl && (
                    <>
                      <clipPath id="totePrintArea">
                        <rect x="95" y="140" width="90" height="90" />
                      </clipPath>
                      <image
                        href={previewUrl}
                        x="95"
                        y="140"
                        width="90"
                        height="90"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#totePrintArea)"
                      />
                    </>
                  )}
                  {!previewUrl && (
                    <rect
                      x="95"
                      y="140"
                      width="90"
                      height="90"
                      fill="none"
                      stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}
                      strokeDasharray="4 4"
                    />
                  )}
                </svg>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

        <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-r border-white/10 p-5 flex flex-col gap-6 pb-32">
          <div>
            <h2 className="font-semibold text-white mb-2">
              צבע <span className="font-normal text-neutral-500">· {TOTE_COLOR_LABELS[color]}</span>
            </h2>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={TOTE_COLOR_LABELS[c]}
                  aria-pressed={color === c}
                  style={{ backgroundColor: TOTE_COLOR_HEX[c] }}
                  className={`h-11 w-11 rounded-full border-2 transition-all ${
                    color === c ? "border-white scale-110 shadow-[0_0_0_3px_rgba(139,92,246,0.5)]" : "border-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">גודל</h2>
            <p className="text-sm text-neutral-400">38×42 ס&quot;מ — טוט בג קלאסי</p>
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
