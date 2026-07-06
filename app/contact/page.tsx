export const metadata = { title: "צור קשר" };

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@example.com";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default function ContactPage() {
  return (
    <div className="max-w-[600px] mx-auto px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">צור קשר</h1>
      <p className="text-neutral-600 mb-8">יש לכם שאלה לגבי הזמנה קיימת או עיצוב? נשמח לעזור.</p>

      <div className="flex flex-col gap-4">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center justify-between h-14 px-4 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
        >
          <span>אימייל</span>
          <span className="text-neutral-500">{CONTACT_EMAIL}</span>
        </a>

        {WHATSAPP_NUMBER && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between h-14 px-4 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <span>וואטסאפ</span>
            <span className="text-neutral-500" dir="ltr">
              {WHATSAPP_NUMBER}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
