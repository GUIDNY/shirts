"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import type { CustomerDetails } from "@/lib/types";

const EMPTY: CustomerDetails = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  zip: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { item, customer, setCustomer, hydrated } = useCart();
  const [form, setForm] = useState<CustomerDetails>(customer || EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) return null;

  if (!item) {
    router.replace("/cart");
    return null;
  }

  function update<K extends keyof CustomerDetails>(key: K, value: CustomerDetails[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.customerName || !form.phone || !form.email || !form.address || !form.city || !form.zip) {
      setError("נא למלא את כל שדות החובה");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("כתובת אימייל לא תקינה");
      return;
    }

    setCustomer(form);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, customer: form }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "יצירת התשלום נכשלה, נסו שוב");
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("משהו השתבש, נסו שוב");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">פרטי משלוח</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="שם מלא" required>
          <input
            className="input"
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            autoComplete="name"
          />
        </Field>

        <Field label="טלפון" required>
          <input
            className="input"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>

        <Field label="אימייל" required>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </Field>

        <Field label="כתובת מלאה" required>
          <input
            className="input"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            autoComplete="street-address"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="עיר" required>
            <input
              className="input"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              autoComplete="address-level2"
            />
          </Field>
          <Field label="מיקוד" required>
            <input
              className="input"
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              autoComplete="postal-code"
            />
          </Field>
        </div>

        <Field label="הערות להזמנה">
          <textarea
            className="input min-h-24 resize-y"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </Field>

        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2"
        >
          {submitting ? "מעביר לתשלום..." : "המשך לתשלום"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          height: 44px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0 12px;
          font-size: 16px;
          width: 100%;
        }
        .input:focus {
          outline: 2px solid #111;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-800">
        {label} {required && <span className="text-red-700">*</span>}
      </span>
      {children}
    </label>
  );
}
