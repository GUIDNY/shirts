import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  received: "bg-neutral-100 text-neutral-700",
  paid: "bg-blue-50 text-blue-800",
  sent_to_gelato: "bg-amber-50 text-amber-800",
  printing: "bg-amber-50 text-amber-800",
  shipped: "bg-purple-50 text-purple-800",
  completed: "bg-green-50 text-green-800",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
