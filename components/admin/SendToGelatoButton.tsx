"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendToGelatoButton({
  orderId,
  mode,
  isPaid,
}: {
  orderId: string;
  mode: "create_draft" | "convert";
  isPaid: boolean;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConvert = mode === "convert";

  async function handleClick() {
    if (isConvert) {
      const warning = isPaid
        ? "לאשר את ההזמנה לייצור ב-Gelato? פעולה זו תחויב ואינה ניתנת לביטול."
        : "ההזמנה עדיין לא שולמה! לאשר בכל זאת לייצור ב-Gelato? פעולה זו תחויב ואינה ניתנת לביטול.";
      if (!window.confirm(warning)) return;
    }

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/gelato/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "הפעולה נכשלה");
        return;
      }
      router.refresh();
    } catch {
      setError("משהו השתבש, נסו שוב");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={sending}
        className="h-10 px-4 rounded-md bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {sending
          ? "שולח..."
          : isConvert
            ? "אשר לייצור והדפסה"
            : "צור דראפט ב-Gelato"}
      </button>
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
    </div>
  );
}
