"use client";

import type { DesignTransform } from "@/lib/types";

interface Props {
  transform: DesignTransform;
  baseScale: number;
  onChange: (t: DesignTransform) => void;
  onRecenter: () => void;
}

const SIZE_STEP = 10;
const MIN_SIZE_PERCENT = 20;
const MAX_SIZE_PERCENT = 300;
const ROTATE_STEP = 15;

export default function DesignOptionsPanel({ transform, baseScale, onChange, onRecenter }: Props) {
  const sizePercent = Math.round((transform.scaleX / baseScale) * 100);
  const rotation = Math.round(((transform.rotation % 360) + 360) % 360);

  function adjustSize(delta: number) {
    const next = Math.min(MAX_SIZE_PERCENT, Math.max(MIN_SIZE_PERCENT, sizePercent + delta));
    const scale = baseScale * (next / 100);
    onChange({ ...transform, scaleX: scale, scaleY: scale });
  }

  function adjustRotation(delta: number) {
    onChange({ ...transform, rotation: transform.rotation + delta });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-white">אפשרויות עיצוב</h2>
        <button
          type="button"
          onClick={onRecenter}
          className="text-xs text-neutral-400 hover:text-white underline underline-offset-2"
        >
          מרכז מחדש
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">גודל</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustSize(-SIZE_STEP)}
              aria-label="הקטן"
              className="h-8 w-8 rounded-md border border-white/15 text-white hover:bg-white/5 transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center text-sm text-white tabular-nums">{sizePercent}%</span>
            <button
              type="button"
              onClick={() => adjustSize(SIZE_STEP)}
              aria-label="הגדל"
              className="h-8 w-8 rounded-md border border-white/15 text-white hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">סיבוב</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjustRotation(-ROTATE_STEP)}
              aria-label="סובב שמאלה"
              className="h-8 w-8 rounded-md border border-white/15 text-white hover:bg-white/5 transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center text-sm text-white tabular-nums">{rotation}°</span>
            <button
              type="button"
              onClick={() => adjustRotation(ROTATE_STEP)}
              aria-label="סובב ימינה"
              className="h-8 w-8 rounded-md border border-white/15 text-white hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
