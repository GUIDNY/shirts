"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="h-9 px-4 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
    >
      התנתקות
    </button>
  );
}
