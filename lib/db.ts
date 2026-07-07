import "server-only";
import { neon } from "@neondatabase/serverless";
import type { OrderRecord } from "./types";

type Sql = ReturnType<typeof neon>;

let sqlClient: Sql | undefined;

/**
 * Created lazily on first use so the build doesn't require env vars
 * (Vercel collects page data at build time before envs may be set).
 */
export function sql(): Sql {
  if (!sqlClient) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set in environment variables.");
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

export interface NewOrder {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  notes: string | null;
  product_type: string;
  size: string;
  color: string;
  quantity: number;
  image_url: string;
  mockup_url: string;
  print_file_url: string;
  back_image_url: string | null;
  back_mockup_url: string | null;
  back_print_file_url: string | null;
  price: number;
}

export async function insertOrder(order: NewOrder): Promise<OrderRecord> {
  const rows = (await sql()`
    insert into orders (
      customer_name, phone, email, address, city, zip, notes,
      product_type, size, color, quantity, image_url, mockup_url, print_file_url,
      back_image_url, back_mockup_url, back_print_file_url, price
    ) values (
      ${order.customer_name}, ${order.phone}, ${order.email}, ${order.address},
      ${order.city}, ${order.zip}, ${order.notes},
      ${order.product_type}, ${order.size}, ${order.color}, ${order.quantity},
      ${order.image_url}, ${order.mockup_url}, ${order.print_file_url},
      ${order.back_image_url}, ${order.back_mockup_url}, ${order.back_print_file_url}, ${order.price}
    )
    returning *
  `) as OrderRecord[];
  return rows[0];
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const rows = (await sql()`select * from orders where id = ${id}`) as OrderRecord[];
  return rows[0] ?? null;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const rows = (await sql()`select * from orders order by created_at desc`) as OrderRecord[];
  return rows;
}

export async function updateOrder(
  id: string,
  fields: Partial<
    Pick<OrderRecord, "payment_status" | "order_status" | "gelato_order_id" | "stripe_session_id">
  >
): Promise<OrderRecord | null> {
  const rows = (await sql()`
    update orders set
      payment_status = coalesce(${fields.payment_status ?? null}, payment_status),
      order_status = coalesce(${fields.order_status ?? null}, order_status),
      gelato_order_id = coalesce(${fields.gelato_order_id ?? null}, gelato_order_id),
      stripe_session_id = coalesce(${fields.stripe_session_id ?? null}, stripe_session_id),
      updated_at = now()
    where id = ${id}
    returning *
  `) as OrderRecord[];
  return rows[0] ?? null;
}

export async function updateOrderByGelatoId(
  gelatoOrderId: string,
  fields: Partial<Pick<OrderRecord, "order_status">>
): Promise<OrderRecord | null> {
  const rows = (await sql()`
    update orders set
      order_status = coalesce(${fields.order_status ?? null}, order_status),
      updated_at = now()
    where gelato_order_id = ${gelatoOrderId}
    returning *
  `) as OrderRecord[];
  return rows[0] ?? null;
}
