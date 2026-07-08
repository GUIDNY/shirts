"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useCart } from "@/components/CartProvider";
import { calculatePrice } from "@/lib/pricing";
import { FLAT_ASSETS, STAGE_WIDTH, STAGE_HEIGHT } from "@/lib/studio";
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
import ToolRail from "@/components/design/ToolRail";
import DesignOptionsPanel from "@/components/design/DesignOptionsPanel";
import StickyCheckoutBar from "@/components/design/StickyCheckoutBar";

const ShirtDesignerCanvas = dynamic(() => import("@/components/ShirtDesignerCanvas"), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[400px] sm:w-[360px] sm:h-[480px] rounded-lg bg-[#1a1a20] animate-pulse" />,
});

const ModelPreview = dynamic(() => import("@/components/ModelPreview"), {
  ssr: false,
  loading: () => <div className="w-[300px] h-[400px] sm:w-[360px] sm:h-[480px] rounded-lg bg-[#1a1a20] animate-pulse" />,
});

const PRODUCT_TYPES: ProductType[] = ["men", "women", "kids"];
const MAX_SIZE_MB = 20;

interface SideDesign {
  file: File | null;
  url: string | null;
  transform: DesignTransform | null;
  /** The auto-fit scale captured the moment a design is first placed — the 100% baseline for the size stepper. */
  baseScale: number | null;
}

const EMPTY_SIDE: SideDesign = { file: null, url: null, transform: null, baseScale: null };

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
  const [zoomPct, setZoomPct] = useState(100);

  const frontCanvasRef = useRef<ShirtDesignerCanvasHandle>(null);
  const backCanvasRef = useRef<ShirtDesignerCanvasHandle>(null);

  const price = useMemo(() => calculatePrice(quantity), [quantity]);
  const active = designs[side];

  function updateSide(s: PrintSide, patch: Partial<SideDesign>) {
    setDesigns((prev) => {
      const prevSide = prev[s];
      const next = { ...prevSide, ...patch };
      // capture the auto-fit scale once, the first time a transform is set
      if (patch.transform && prevSide.baseScale == null) {
        next.baseScale = patch.transform.scaleX;
      }
      return { ...prev, [s]: next };
    });
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

    updateSide(side, { file, url: URL.createObjectURL(file), transform: null, baseScale: null });
  }

  function recenterActive() {
    const t = active.transform;
    if (!t) return;
    const asset = FLAT_ASSETS[side];
    const printPx = {
      x: asset.print.x * STAGE_WIDTH,
      y: asset.print.y * STAGE_HEIGHT,
      width: asset.print.w * STAGE_WIDTH,
      height: asset.print.h * STAGE_HEIGHT,
    };
    updateSide(side, {
      transform: {
        ...t,
        x: printPx.x + printPx.width / 2,
        y: printPx.y + printPx.height * 0.42,
      },
    });
  }

  /** Quick placement presets — "large" matches the default auto-fit centered
   *  print; "small" mimics a small brand-logo placement (chest corner up
   *  front, near the collar on the back). */
  function applyPreset(kind: "large" | "small") {
    const t = active.transform;
    const base = active.baseScale;
    if (!t || !base) return;
    const asset = FLAT_ASSETS[side];
    const printPx = {
      x: asset.print.x * STAGE_WIDTH,
      y: asset.print.y * STAGE_HEIGHT,
      width: asset.print.w * STAGE_WIDTH,
      height: asset.print.h * STAGE_HEIGHT,
    };
    if (kind === "large") {
      updateSide(side, {
        transform: {
          ...t,
          scaleX: base,
          scaleY: base,
          x: printPx.x + printPx.width / 2,
          y: printPx.y + printPx.height * 0.42,
          rotation: 0,
        },
      });
    } else {
      const scale = base * 0.4;
      const posX = side === "front" ? printPx.x + printPx.width * 0.3 : printPx.x + printPx.width * 0.5;
      const posY = printPx.y + printPx.height * 0.22;
      updateSide(side, {
        transform: { ...t, scaleX: scale, scaleY: scale, x: posX, y: posY, rotation: 0 },
      });
    }
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
      // Each file is uploaded directly browser-to-Blob (not through a
      // route handler), so a real original photo's size is never limited
      // by the platform's serverless function body cap — this used to be
      // one multipart POST bundling the raw design + rendered mockup +
      // 10x-scaled print file together, which could exceed that limit.
      const id = crypto.randomUUID();
      const uploadOne = (pathname: string, data: File | Blob) =>
        upload(pathname, data, { access: "public", handleUploadUrl: "/api/blob-upload" }).then((b) => b.url);

      const dataUrlToBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();

      const frontExt = designs.front.file.type === "image/png" ? "png" : "jpg";
      const uploads: Promise<string>[] = [
        uploadOne(`designs/${id}-front.${frontExt}`, designs.front.file),
        dataUrlToBlob(frontCanvasRef.current.exportMockup()).then((blob) =>
          uploadOne(`mockups/${id}-front.png`, blob)
        ),
        dataUrlToBlob(frontCanvasRef.current.exportPrintFile()).then((blob) =>
          uploadOne(`prints/${id}-front.png`, blob)
        ),
      ];

      const hasBack = Boolean(designs.back.file && backCanvasRef.current);
      if (hasBack) {
        const backExt = designs.back.file!.type === "image/png" ? "png" : "jpg";
        uploads.push(
          uploadOne(`designs/${id}-back.${backExt}`, designs.back.file!),
          dataUrlToBlob(backCanvasRef.current!.exportMockup()).then((blob) =>
            uploadOne(`mockups/${id}-back.png`, blob)
          ),
          dataUrlToBlob(backCanvasRef.current!.exportPrintFile()).then((blob) =>
            uploadOne(`prints/${id}-back.png`, blob)
          )
        );
      }

      const [imageUrl, mockupUrl, printFileUrl, backImageUrl, backMockupUrl, backPrintFileUrl] =
        await Promise.all(uploads);

      setItem({
        category: "apparel",
        productType,
        color,
        size,
        quantity,
        imageUrl,
        mockupUrl,
        printFileUrl,
        transform: designs.front.transform as DesignTransform,
        backImageUrl: backImageUrl || null,
        backMockupUrl: backMockupUrl || null,
        backPrintFileUrl: backPrintFileUrl || null,
        backTransform: designs.back.transform || null,
      });

      router.push("/cart");
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  }

  const uploadLabel = side === "front" ? "העלאת עיצוב לחזית" : "העלאת עיצוב לגב";

  return (
    <div className="bg-[#0a0a0f] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col lg:flex-row">
        <ToolRail uploadLabel={uploadLabel} onFileChange={handleFileChange} />

        {/* center: view tabs + canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0">
            <span className="text-sm text-neutral-500 hidden sm:block">עיצוב חדש</span>
            <div className="flex gap-1 rounded-lg bg-white/5 border border-white/10 p-1 mx-auto sm:mx-0" role="tablist" aria-label="תצוגה">
              <button
                type="button"
                role="tab"
                aria-selected={view === "flat" && side === "front"}
                onClick={() => {
                  setView("flat");
                  setSide("front");
                }}
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  view === "flat" && side === "front"
                    ? "brand-gradient-bg text-white"
                    : "text-neutral-400 hover:text-white"
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
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  view === "flat" && side === "back"
                    ? "brand-gradient-bg text-white"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                גב
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "model"}
                onClick={() => setView("model")}
                className={`h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  view === "model" ? "brand-gradient-bg text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                על דוגמן
              </button>
            </div>
            <span className="hidden sm:block w-16" aria-hidden="true" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-8 md:py-12">
            <div
              style={{ transform: `scale(${zoomPct / 100})` }}
              className="transition-transform duration-150 rounded-2xl bg-[#141419] ring-1 ring-white/10 shadow-2xl p-4 md:p-6"
            >
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
            </div>

            {view === "flat" && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => setZoomPct((z) => Math.max(50, z - 10))}
                  aria-label="הקטן תצוגה"
                  className="h-7 w-7 rounded text-white hover:bg-white/10 transition-colors"
                >
                  −
                </button>
                <span className="text-sm text-neutral-300 tabular-nums w-11 text-center">{zoomPct}%</span>
                <button
                  type="button"
                  onClick={() => setZoomPct((z) => Math.min(150, z + 10))}
                  aria-label="הגדל תצוגה"
                  className="h-7 w-7 rounded text-white hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            )}

            {view === "model" ? (
              <p className="text-sm text-neutral-500 text-center">
                כך ההדפסה הקדמית תיראה במציאות — חזרו ל&quot;חזית&quot; כדי לערוך
              </p>
            ) : active.url ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-neutral-500 text-center">
                  גררו את התמונה כדי להזיז, ומהפינות כדי להגדיל, להקטין או לסובב
                </p>
                <label className="text-sm font-medium text-neutral-300 underline cursor-pointer">
                  החלף תמונה
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <label className="lg:hidden w-full max-w-[360px] flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-white/15 cursor-pointer hover:border-white/30 transition-colors text-neutral-400 text-sm">
                <span>{uploadLabel}</span>
                <span className="text-xs">PNG/JPG, עד 20MB</span>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        {/* product options panel */}
        <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-r border-white/10 p-5 flex flex-col gap-6 pb-32">
          <div>
            <h2 className="font-semibold text-white mb-2">סוג מוצר</h2>
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
                      ? "brand-gradient-bg border-transparent text-white"
                      : "border-white/15 text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  {PRODUCT_LABELS[pt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">
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
                    color === c ? "border-white scale-110 shadow-[0_0_0_3px_rgba(139,92,246,0.5)]" : "border-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">מידה</h2>
            <div className="flex gap-2 flex-wrap">
              {SIZES.filter((s) => !(productType === "kids" && s === "XXL")).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-11 w-14 rounded-md border text-sm font-medium transition-colors ${
                    size === s
                      ? "brand-gradient-bg border-transparent text-white"
                      : "border-white/15 text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-white mb-2">כמות</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-11 w-11 rounded-md border border-white/15 text-white text-lg hover:bg-white/5"
                aria-label="הפחת כמות"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-11 w-11 rounded-md border border-white/15 text-white text-lg hover:bg-white/5"
                aria-label="הוסף כמות"
              >
                +
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">2+ יחידות: 10% הנחה · 5+ יחידות: 20% הנחה</p>
          </div>

          {view === "flat" && active.url && active.transform && active.baseScale && (
            <div className="border-t border-white/10 pt-6 flex flex-col gap-5">
              <div>
                <h2 className="font-semibold text-white mb-2">גודל ומיקום מהיר</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset("large")}
                    className="h-11 rounded-md border border-white/15 text-neutral-200 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    הדפסה גדולה במרכז
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset("small")}
                    className="h-11 rounded-md border border-white/15 text-neutral-200 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    {side === "front" ? "לוגו קטן בחזה" : "לוגו קטן למעלה"}
                  </button>
                </div>
              </div>

              <DesignOptionsPanel
                transform={active.transform}
                baseScale={active.baseScale}
                onChange={(t) => updateSide(side, { transform: t })}
                onRecenter={recenterActive}
              />
            </div>
          )}

          <div className="border-t border-white/10 pt-6">
            <h2 className="font-semibold text-white mb-3">שכבות</h2>
            <div className="flex flex-col gap-2">
              {(["front", "back"] as PrintSide[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setView("flat");
                    setSide(s);
                  }}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    side === s && view === "flat"
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <span className="h-8 w-8 rounded bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                    {designs[s].url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={designs[s].url as string} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </span>
                  <span className="text-neutral-300">{s === "front" ? "חזית" : "גב"}</span>
                  <span className="mr-auto text-xs text-neutral-500">
                    {designs[s].url ? "✓ הועלה" : "לא הועלה"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {designs.back.url && (
            <p className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-md px-3 py-2">
              ✓ ההזמנה כוללת הדפסה על הגב
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </aside>
      </div>

      <StickyCheckoutBar price={price} submitting={submitting} onContinue={handleContinue} />
    </div>
  );
}
