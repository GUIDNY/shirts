"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
        <p>© {new Date().getFullYear()} חולצה אישית. כל הזכויות שמורות.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/terms" className="hover:text-neutral-900 transition-colors">
            תקנון
          </Link>
          <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
            פרטיות
          </Link>
          <Link href="/refund" className="hover:text-neutral-900 transition-colors">
            מדיניות החזרות
          </Link>
          <Link href="/contact" className="hover:text-neutral-900 transition-colors">
            צור קשר
          </Link>
        </div>
      </div>
    </footer>
  );
}
