"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/design")) return null;

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0f]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 flex flex-col md:flex-row justify-between gap-10">
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-right">
          <Logo size={26} />
          <p className="text-sm text-neutral-500 max-w-xs">
            סטודיו לעיצוב והדפסה על חולצות ומוצרים בעיצוב אישי. איכות פרימיום, ללא מינימום הזמנה.
          </p>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end gap-x-16 gap-y-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">מידע</h3>
            <Link href="/design" className="text-sm text-neutral-400 hover:text-white transition-colors">
              עצבו עכשיו
            </Link>
            <Link href="/contact" className="text-sm text-neutral-400 hover:text-white transition-colors">
              צור קשר
            </Link>
            <Link href="/refund" className="text-sm text-neutral-400 hover:text-white transition-colors">
              מדיניות החזרות
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">משפטי</h3>
            <Link href="/terms" className="text-sm text-neutral-400 hover:text-white transition-colors">
              תקנון
            </Link>
            <Link href="/privacy" className="text-sm text-neutral-400 hover:text-white transition-colors">
              פרטיות
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-5 flex flex-col-reverse md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">© {new Date().getFullYear()} TEEVO. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
