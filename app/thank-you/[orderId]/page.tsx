import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { OrderRecord } from "@/lib/types";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { orderId } = await params;
  const { session_id } = await searchParams;

  const { data: order } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single<OrderRecord>();

  if (!order) notFound();

  let confirmedOrder = order;

  // Fallback in case the Stripe webhook hasn't landed yet by the time the
  // customer is redirected back from Checkout.
  if (confirmedOrder.payment_status !== "paid" && session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        const { data: updated } = await getSupabaseAdmin()
          .from("orders")
          .update({ payment_status: "paid", order_status: "paid" })
          .eq("id", orderId)
          .select()
          .single<OrderRecord>();
        if (updated) confirmedOrder = updated;
      }
    } catch {
      // fall through and show current status
    }
  }

  const isPaid = confirmedOrder.payment_status === "paid";

  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-20 text-center">
      {isPaid ? (
        <>
          <ClearCartOnSuccess />
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">ההזמנה התקבלה בהצלחה!</h1>
          <p className="text-neutral-600 mb-1">
            שלחנו מייל אישור ל-{confirmedOrder.email}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">מעבדים את התשלום...</h1>
          <p className="text-neutral-600 mb-1">רעננו את הדף בעוד כמה שניות</p>
        </>
      )}

      <p className="mt-6 text-sm text-neutral-500">מספר הזמנה</p>
      <p className="font-mono text-lg mb-8">{confirmedOrder.id.slice(0, 8).toUpperCase()}</p>

      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
      >
        חזרה לדף הבית
      </Link>
    </div>
  );
}
