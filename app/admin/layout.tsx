import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-bold">
            ניהול הזמנות
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">{children}</div>
    </div>
  );
}
