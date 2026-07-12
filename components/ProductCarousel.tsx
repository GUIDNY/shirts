"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export interface CarouselItem {
  href: string;
  label: string;
  price: string;
  src?: string;
  alt?: string;
  visual?: ReactNode;
}

export default function ProductCarousel({ items }: { items: CarouselItem[] }) {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  function go(next: number) {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none">
        {items.map((item, i) => (
          <Link
            key={item.href}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={item.href}
            className="shrink-0 w-[46%] sm:w-[220px] snap-start rounded-xl border border-neutral-200 overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-shadow group"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              {item.visual ? (
                item.visual
              ) : (
                <Image
                  src={item.src!}
                  alt={item.alt!}
                  fill
                  className="object-cover group-hover:scale-[1.05] transition-transform"
                  sizes="(max-width: 640px) 46vw, 220px"
                />
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-neutral-900 text-sm">{item.label}</p>
              <p className="text-sm text-neutral-500">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(index + 1)}
        disabled={index >= items.length - 1}
        aria-label="המוצר הבא"
        className="hidden md:flex absolute top-[38%] -translate-y-1/2 -left-4 h-10 w-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-neutral-200 items-center justify-center hover:bg-neutral-50 disabled:opacity-0 disabled:pointer-events-none transition-opacity z-10"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M8 4l6 6-6 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(index - 1)}
        disabled={index <= 0}
        aria-label="המוצר הקודם"
        className="hidden md:flex absolute top-[38%] -translate-y-1/2 -right-4 h-10 w-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-neutral-200 items-center justify-center hover:bg-neutral-50 disabled:opacity-0 disabled:pointer-events-none transition-opacity z-10"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M12 4l-6 6 6 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
