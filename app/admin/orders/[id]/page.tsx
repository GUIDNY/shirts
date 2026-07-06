import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin, DESIGNS_BUCKET, MOCKUPS_BUCKET } from "@/lib/supabase/server";
import { COLOR_LABELS, PRODUCT_LABELS, type OrderRecord } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import SendToGelatoButton from "@/components/admin/SendToGelatoButton";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: order } = await getSupabaseAdmin()
    .from("orders")
    .select("*")
    .eq("id", id)
    .single<OrderRecord>();

  if (!order) notFound();

  const { data: mockupUrlData } = getSupabaseAdmin().storage.from(MOCKUPS_BUCKET).getPublicUrl(order.mockup_path);
  const { data: signedDesignData } = await getSupabaseAdmin().storage
    .from(DESIGNS_BUCKET)
    .createSignedUrl(order.image_path, 60 * 60);

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
            <dt className="text-neutral-500">מוצר</dt>
            <dd>{PRODUCT_LABELS[order.product_type]}</dd>
            <dt className="text-neutral-500">צבע</dt>
            <dd>{COLOR_LABELS[order.color]}</dd>
            <dt className="text-neutral-500">מידה</dt>
            <dd>{order.size}</dd>
            <dt className="text-neutral-500">כמות</dt>
            <dd>{order.quantity}</dd>
            <dt className="text-neutral-500">מחיר</dt>
            <dd>{order.price} ₪</dd>
          </dl>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">תצוגה מקדימה (Mockup)</h2>
          {mockupUrlData?.publicUrl && (
            <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden bg-neutral-50">
              <Image src={mockupUrlData.publicUrl} alt="Mockup" fill className="object-contain" unoptimized />
            </div>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="font-semibold mb-3">קובץ עיצוב מקורי</h2>
          {signedDesignData?.signedUrl ? (
            <a
              href={signedDesignData.signedUrl}
              download
              className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              הורדת קובץ העיצוב
            </a>
          ) : (
            <p className="text-sm text-neutral-500">לא ניתן ליצור קישור להורדה</p>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-5 md:col-span-2">
          <h2 className="font-semibold mb-3">Gelato</h2>
          {order.gelato_order_id ? (
            <p className="text-sm text-neutral-700">
              נשלח ל-Gelato · מזהה הזמנה: <span className="font-mono">{order.gelato_order_id}</span>
            </p>
          ) : order.payment_status === "paid" ? (
            <SendToGelatoButton orderId={order.id} />
          ) : (
            <p className="text-sm text-neutral-500">ניתן לשלוח ל-Gelato רק לאחר שהתשלום אושר</p>
          )}
        </div>
      </div>
    </div>
  );
}
