"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const { item } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          חולצה<span className="text-blue-900">אישית</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
          <Link href="/design" className="hover:text-neutral-900 transition-colors">
            עצב חולצה
          </Link>
          <Link href="/contact" className="hover:text-neutral-900 transition-colors">
            צור קשר
          </Link>
        </nav>

        <Link
          href="/cart"
          className="relative inline-flex items-center justify-center h-10 px-4 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
          aria-label="סל קניות"
        >
          סל קניות
          {item && item.quantity > 0 && (
            <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center">
              {item.quantity}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
