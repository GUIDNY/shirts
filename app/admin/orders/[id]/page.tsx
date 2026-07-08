import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db";
import {
  COLOR_LABELS,
  POSTER_PAPER_LABELS,
  PRODUCT_LABELS,
  TOTE_COLOR_LABELS,
  type PosterPaper,
  type ToteColor,
} from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import SendToGelatoButton from "@/components/admin/SendToGelatoButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const draftCreated = Boolean(order.gelato_order_id);
  const inProduction = ["sent_to_gelato", "printing", "shipped", "completed"].includes(
    order.order_status
  );

  return (
    <div>
      <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
        ← חזרה להזמנות
      </Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <h1 className="text-2xl font-bold">הזמנה #{order.id.slice(0, 8).toUpperCase()}</h1>
        <StatusSelect orderId={order.id} status={order.order_status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">פרטי לקוח</h2>
          <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <dt className="text-neutral-500">שם</dt>
            <dd>{order.customer_name}</dd>
            <dt className="text-neutral-500">טלפון</dt>
            <dd dir="ltr" className="text-right">{order.phone}</dd>
            <dt className="text-neutral-500">אימייל</dt>
            <dd>{order.email}</dd>
            <dt className="text-neutral-500">כתובת</dt>
            <dd>
              {order.address}, {order.city} {order.zip}
            </dd>
            {order.notes && (
              <>
                <dt className="text-neutral-500">הערות</dt>
                <dd>{order.notes}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">פרטי מוצר</h2>
          <dl className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            {order.product_category === "poster" ? (
              <>
                <dt className="text-neutral-500">מוצר</dt>
                <dd>פוסטר 50×70 ס&quot;מ</dd>
                <dt className="text-neutral-500">נייר</dt>
                <dd>{POSTER_PAPER_LABELS[order.poster_paper as PosterPaper]}</dd>
              </>
            ) : order.product_category === "tote" ? (
              <>
                <dt className="text-neutral-500">מוצר</dt>
                <dd>טוט בג 38×42 ס&quot;מ</dd>
                <dt className="text-neutral-500">צבע</dt>
                <dd>{TOTE_COLOR_LABELS[order.tote_color as ToteColor]}</dd>
              </>
            ) : (
              <>
                <dt className="text-neutral-500">מוצר</dt>
                <dd>{PRODUCT_LABELS[order.product_type]}</dd>
                <dt className="text-neutral-500">צבע</dt>
                <dd>{COLOR_LABELS[order.color]}</dd>
                <dt className="text-neutral-500">מידה</dt>
                <dd>{order.size}</dd>
              </>
            )}
            <dt className="text-neutral-500">כמות</dt>
            <dd>{order.quantity}</dd>
            <dt className="text-neutral-500">מחיר</dt>
            <dd>{order.price} ₪</dd>
            <dt className="text-neutral-500">תשלום</dt>
            <dd>
              {order.payment_status === "paid" ? "שולם" : order.payment_status === "failed" ? "נכשל" : "ממתין"}
            </dd>
          </dl>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">תצוגה מקדימה (Mockup)</h2>
          <div className={`grid gap-3 ${order.back_mockup_url ? "grid-cols-2" : "grid-cols-1"}`}>
            <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-neutral-50">
              <Image src={order.mockup_url} alt="Mockup חזית" fill className="object-contain" unoptimized />
            </div>
            {order.back_mockup_url && (
              <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden bg-neutral-50">
                <Image src={order.back_mockup_url} alt="Mockup גב" fill className="object-contain" unoptimized />
              </div>
            )}
          </div>
          {order.back_mockup_url && (
            <p className="text-xs text-neutral-500 mt-2">חזית · גב — הזמנה עם הדפסה דו-צדדית</p>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">קבצי עיצוב</h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <a
                href={order.image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                הורדת עיצוב מקורי (חזית)
              </a>
              {order.back_image_url && (
                <a
                  href={order.back_image_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  הורדת עיצוב מקורי (גב)
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {order.print_file_url && (
                <a
                  href={order.print_file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  קובץ הדפסה למדפסת (חזית) — זה מה שנשלח ל-Gelato
                </a>
              )}
              {order.back_print_file_url && (
                <a
                  href={order.back_print_file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  קובץ הדפסה למדפסת (גב) — זה מה שנשלח ל-Gelato
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5 md:col-span-2">
          <h2 className="font-semibold mb-3">Gelato</h2>
          {draftCreated ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-700">
                {inProduction ? "נשלח לייצור" : "דראפט ממתין בחשבון Gelato"} · מזהה:{" "}
                <span className="font-mono">{order.gelato_order_id}</span>
              </p>
              {!inProduction && (
                <SendToGelatoButton orderId={order.id} mode="convert" isPaid={order.payment_status === "paid"} />
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-500">הדראפט לא נוצר אוטומטית — אפשר לנסות שוב:</p>
              <SendToGelatoButton orderId={order.id} mode="create_draft" isPaid={order.payment_status === "paid"} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
