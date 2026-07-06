export const metadata = { title: "מדיניות פרטיות" };

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">מדיניות פרטיות</h1>
      <div className="flex flex-col gap-4 text-neutral-700 leading-relaxed text-sm">
        <p>
          אנו אוספים את פרטי הלקוח (שם, טלפון, אימייל וכתובת) לצורך עיבוד ההזמנה, יצירת קשר לגבי
          סטטוס ההזמנה ומשלוח המוצר בלבד.
        </p>
        <p>
          תמונות ועיצובים שהועלו לאתר נשמרים באחסון מאובטח ומשמשים אך ורק לצורך הדפסת ההזמנה שביצעתם.
        </p>
        <p>
          פרטי תשלום מעובדים ישירות על ידי ספק סליקה חיצוני מאובטח (Stripe / PayPal), ואיננו שומרים
          פרטי כרטיס אשראי בשרתים שלנו.
        </p>
        <p>אנו לא מעבירים את פרטיכם לצד שלישי, למעט ספקי השירות הנדרשים להשלמת ההזמנה (הדפסה ומשלוח).</p>
      </div>
    </div>
  );
}
