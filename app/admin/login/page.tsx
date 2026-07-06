"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "התחברות נכשלה");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("משהו השתבש, נסו שוב");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[360px] mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold mb-6 text-center">כניסת ניהול</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-800">סיסמה</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="h-11 border border-neutral-200 rounded-md px-3 focus:outline-2 focus:outline-neutral-900"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {submitting ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
