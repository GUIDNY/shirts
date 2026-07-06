export const metadata = { title: "תקנון" };

export default function TermsPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">תקנון האתר</h1>
      <div className="flex flex-col gap-4 text-neutral-700 leading-relaxed text-sm">
        <p>
          השימוש באתר ובשירותיו כפוף לתנאים המפורטים להלן. הזמנת מוצר באתר מהווה הסכמה מלאה לתנאים אלו.
        </p>
        <h2 className="font-semibold text-neutral-900 mt-2">הזמנות</h2>
        <p>
          כל הזמנה כפופה לאישור תשלום. לאחר אישור התשלום, ההזמנה תעבור להליך הדפסה ומשלוח בהתאם לפרטים
          שסופקו על ידי הלקוח. יש לוודא את נכונות פרטי המשלוח והעיצוב לפני השלמת ההזמנה, שכן החולצות
          מודפסות לפי דרישה אישית.
        </p>
        <h2 className="font-semibold text-neutral-900 mt-2">קניין רוחני</h2>
        <p>
          הלקוח מצהיר כי הוא בעל הזכויות בתמונה/עיצוב שהועלה לאתר, או שיש לו הרשאה להשתמש בו, ונושא
          באחריות מלאה לכל הפרה של זכויות יוצרים או קניין רוחני של צד שלישי.
        </p>
        <h2 className="font-semibold text-neutral-900 mt-2">מחירים ותשלום</h2>
        <p>המחירים המוצגים באתר כוללים מע&quot;מ. התשלום מתבצע באמצעים מאובטחים בלבד.</p>
      </div>
    </div>
  );
}
