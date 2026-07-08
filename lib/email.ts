import "server-only";
import { Resend } from "resend";
import type { OrderRecord, PosterPaper } from "./types";
import { PRODUCT_LABELS, COLOR_LABELS, POSTER_PAPER_LABELS } from "./types";

const resendApiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "orders@example.com";

export async function sendOrderConfirmationEmail(order: OrderRecord) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not set — skipping order confirmation email.");
    return;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: fromAddress,
    to: order.email,
    subject: `ההזמנה שלך התקבלה #${order.id.slice(0, 8)}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>תודה על ההזמנה, ${order.customer_name}!</h2>
        <p>קיבלנו את התשלום וההזמנה שלך בטיפול.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 4px 0; color: #666;">מספר הזמנה</td><td>${order.id}</td></tr>
          ${
            order.product_category === "poster"
              ? `<tr><td style="padding: 4px 0; color: #666;">מוצר</td><td>פוסטר 50×70 · ${POSTER_PAPER_LABELS[order.poster_paper as PosterPaper]}</td></tr>`
              : `<tr><td style="padding: 4px 0; color: #666;">מוצר</td><td>${PRODUCT_LABELS[order.product_type]}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">צבע</td><td>${COLOR_LABELS[order.color]}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">מידה</td><td>${order.size}</td></tr>`
          }
          <tr><td style="padding: 4px 0; color: #666;">כמות</td><td>${order.quantity}</td></tr>
          <tr><td style="padding: 4px 0; color: #666;">סה"כ לתשלום</td><td>${order.price} ₪</td></tr>
        </table>
        <p>נעדכן אותך במייל כשההזמנה תישלח.</p>
      </div>
    `,
  });
}
