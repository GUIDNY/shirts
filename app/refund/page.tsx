export const metadata = { title: "מדיניות החזרות וביטולים" };

export default function RefundPolicyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">מדיניות החזרות וביטולים</h1>
      <div className="flex flex-col gap-4 text-neutral-700 leading-relaxed text-sm">
        <p>
          מכיוון שכל חולצה מודפסת אישית לפי דרישת הלקוח, לא ניתן לבטל הזמנה לאחר שהחלה בהליך הדפסה.
        </p>
        <p>ניתן לבטל הזמנה או לתקן פרטים ללא עלות בתוך שעה מרגע ביצוע התשלום, וכל עוד ההזמנה לא נשלחה להדפסה.</p>
        <p>
          במקרה של פגם בהדפסה, טעות במידה/צבע שאינה תואמת את ההזמנה שבוצעה, או נזק במשלוח – יש ליצור
          קשר בתוך 7 ימים מקבלת המוצר, ואנו נדאג להחלפה או להחזר כספי מלא.
        </p>
        <p>לבירורים ובקשות ביטול, אנא פנו אלינו בעמוד <a href="/contact" className="text-blue-900 underline">צור קשר</a>.</p>
      </div>
    </div>
  );
}
