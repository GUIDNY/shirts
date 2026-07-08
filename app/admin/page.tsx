import Link from "next/link";
import { listOrders } from "@/lib/db";
import {
  COLOR_LABELS,
  POSTER_PAPER_LABELS,
  PRODUCT_LABELS,
  TOTE_COLOR_LABELS,
  type PosterPaper,
  type ToteColor,
} from "@/lib/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">הזמנות ({orders.length})</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">אין הזמנות עדיין.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm text-right whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 font-medium">מס&apos;</th>
                <th className="px-4 py-3 font-medium">לקוח</th>
                <th className="px-4 py-3 font-medium">מוצר</th>
                <th className="px-4 py-3 font-medium">כמות</th>
                <th className="px-4 py-3 font-medium">מחיר</th>
                <th className="px-4 py-3 font-medium">תשלום</th>
                <th className="px-4 py-3 font-medium">Gelato</th>
                <th className="px-4 py-3 font-medium">סטטוס</th>
                <th className="px-4 py-3 font-medium">תאריך</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-mono">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">
                    {order.product_category === "poster"
                      ? `פוסטר · ${POSTER_PAPER_LABELS[order.poster_paper as PosterPaper]}`
                      : order.product_category === "tote"
                        ? `טוט בג · ${TOTE_COLOR_LABELS[order.tote_color as ToteColor]}`
                        : order.product_category === "canvas"
                          ? "קנבס 50×50"
                          : `${PRODUCT_LABELS[order.product_type]} · ${COLOR_LABELS[order.color]} · ${order.size}`}
                  </td>
                  <td className="px-4 py-3">{order.quantity}</td>
                  <td className="px-4 py-3">{order.price} ₪</td>
                  <td className="px-4 py-3">
                    {order.payment_status === "paid" ? (
                      <span className="text-green-700 font-medium">שולם</span>
                    ) : order.payment_status === "failed" ? (
                      <span className="text-red-700 font-medium">נכשל</span>
                    ) : (
                      <span className="text-neutral-500">ממתין</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.gelato_order_id ? (
                      <span className="text-green-700">✓ דראפט</span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.order_status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString("he-IL")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-blue-900 font-medium hover:underline">
                      פרטים
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
