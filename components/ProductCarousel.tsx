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

export default function ProductCarousel({ title, items }: { title: string; items: CarouselItem[] }) {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  function go(next: number) {
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    setIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-neutral-900">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index >= items.length - 1}
            aria-label="המוצר הבא"
            className="h-10 w-10 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index <= 0}
            aria-label="המוצר הקודם"
            className="h-10 w-10 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((item, i) => (
          <Link
            key={item.href}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            href={item.href}
            className="shrink-0 w-[46%] sm:w-[260px] md:w-[280px] snap-start group bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300"
          >
            <div className="relative aspect-square bg-neutral-100 overflow-hidden">
              {item.visual ? (
                item.visual
              ) : (
                <Image
                  src={item.src!}
                  alt={item.alt!}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 46vw, 280px"
                />
              )}
            </div>
            <div className="p-5 text-center border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-900 mb-1">{item.label}</h3>
              <p className="text-sm text-neutral-500">{item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
