"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import Logo from "@/components/Logo";

export default function Header() {
  const { item } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f] border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/design" className="hover:text-white transition-colors">
            עצב חולצה
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            צור קשר
          </Link>
        </nav>

        <Link
          href="/cart"
          className="relative inline-flex items-center justify-center h-10 px-4 rounded-md border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors"
          aria-label="סל קניות"
        >
          סל קניות
          {item && item.quantity > 0 && (
            <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full brand-gradient-bg text-white text-xs flex items-center justify-center">
              {item.quantity}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
