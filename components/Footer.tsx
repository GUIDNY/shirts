"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/design")) return null;

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f] mt-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size={26} />
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} TEEVO. כל הזכויות שמורות.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400">
          <Link href="/terms" className="hover:text-white transition-colors">
            תקנון
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            פרטיות
          </Link>
          <Link href="/refund" className="hover:text-white transition-colors">
            מדיניות החזרות
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            צור קשר
          </Link>
        </div>
      </div>
    </footer>
  );
}
