"use client";

import { useId } from "react";

const MARK_PATH_BAR = "M4 20 L96 20 L68 46 L4 46 Z";
const MARK_PATH_TAIL = "M38 46 L74 46 L54 94 Z";

export function LogoMark({ size = 32, glow = true }: { size?: number; glow?: boolean }) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={
        glow
          ? { filter: "drop-shadow(0 0 4px rgba(139,92,246,0.6)) drop-shadow(0 0 10px rgba(59,130,246,0.4))" }
          : undefined
      }
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path d={MARK_PATH_BAR} fill={`url(#${gradientId})`} />
      <path d={MARK_PATH_TAIL} fill={`url(#${gradientId})`} />
    </svg>
  );
}

export default function Logo({
  size = 32,
  wordmarkClassName = "text-white",
}: {
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className={`text-lg font-extrabold tracking-tight ${wordmarkClassName}`}
        style={{ textShadow: "0 0 16px rgba(139,92,246,0.35)" }}
      >
        TEEVO
      </span>
    </span>
  );
}
