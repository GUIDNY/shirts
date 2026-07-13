"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface HeroImage {
  src: string;
  position?: string;
}

export default function HeroRotator({
  images,
  intervalMs = 6000,
}: {
  images: HeroImage[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % images.length), intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt=""
          fill
          priority={i === 0}
          className="object-cover transition-opacity ease-in-out"
          style={{
            opacity: i === active ? 0.9 : 0,
            objectPosition: img.position ?? "center",
            transitionDuration: "1800ms",
          }}
          sizes="100vw"
        />
      ))}
    </>
  );
}
