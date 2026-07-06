# חולצה אישית — הדפסה על חולצות בעיצוב אישי

אתר הזמנות לחולצות מודפסות לפי דרישה. Next.js 16 (App Router) + TypeScript + Tailwind
CSS v4, Neon Postgres + Vercel Blob (דרך Vercel Marketplace), Stripe Checkout (אופציונלי),
ו-Konva לעורך העיצוב האינטראקטיבי. מחובר ל-Gelato API — כל הזמנה יוצרת דראפט אוטומטית.

## 1. מבנה תיקיות

```
tshirt-print-shop/
├─ app/
│  ├─ page.tsx                        דף הבית
│  ├─ design/page.tsx                 עיצוב החולצה (בורר מוצר/צבע/מידה + קנבס Konva)
│  ├─ cart/page.tsx                   סל קניות
│  ├─ checkout/page.tsx               פרטי לקוח ומשלוח
│  ├─ thank-you/[orderId]/page.tsx    עמוד תודה + אישור הזמנה
│  ├─ terms/ , privacy/ , refund/ , contact/   עמודי מידע
│  ├─ admin/
│  │  ├─ login/page.tsx               כניסת ניהול
│  │  ├─ page.tsx                     טבלת הזמנות
│  │  └─ orders/[id]/page.tsx         פרטי הזמנה + שליחה ל-Gelato
│  └─ api/
│     ├─ upload/route.ts              העלאת קובץ עיצוב + mockup ל-Vercel Blob
│     ├─ checkout/route.ts            יצירת הזמנה + דראפט ב-Gelato (+ Stripe אם מוגדר)
│     ├─ stripe/webhook/route.ts      אישור תשלום מ-Stripe → מסמן הזמנה כ"שולם"
│     ├─ gelato/send/route.ts         (אדמין) יצירת דראפט חוזרת / אישור לייצור
│     ├─ gelato/webhook/route.ts      קליטת עדכוני סטטוס מ-Gelato
│     └─ admin/login|logout, admin/orders/[id]/status   ניהול הרשאות וסטטוס
├─ components/                        Header, Footer, WhatsAppButton, CartProvider,
│                                      ShirtSvg, ShirtDesignerCanvas (Konva), admin/*
├─ lib/
│  ├─ types.ts, pricing.ts, shirtSvg.ts
│  ├─ db.ts                           Neon Postgres — הזמנות (שרת בלבד)
│  ├─ storage.ts                      Vercel Blob — קבצי עיצוב ו-mockups
│  ├─ stripe.ts, email.ts, auth.ts
│  └─ gelato.ts                       Gelato — createGelatoOrder() + convertGelatoDraftToOrder()
├─ db/schema.sql + scripts/migrate.mjs   סכימת orders (npm run db:migrate)
├─ proxy.ts                           הגנת /admin (שם חדש ל-middleware ב-Next.js 16)
└─ .env.example
```

## 2. איך זה עובד

1. **`/design`** — הלקוח בוחר סוג מוצר / צבע / מידה, מעלה תמונה, וממקם אותה על
   קנבס Konva (גרירה להזזה, ידיות בפינות להגדלה/הקטנה/סיבוב). בלחיצה על
   "המשך להזמנה", התמונה המקורית ותמונת ה-mockup המורכבת (`stage.toDataURL()`)
   נשלחות ל-`/api/upload` ומאוחסנות ב-**Vercel Blob** (URL ציבורי עם סיומת
   אקראית — ככה Gelato יכול למשוך את הקובץ ישירות).
2. **`/cart`** ו-**`/checkout`** — עריכת כמות ופרטי משלוח (נשמר ב-localStorage
   דרך `CartProvider`).
3. בלחיצה על "המשך לתשלום", `/api/checkout`:
   - יוצר שורת הזמנה ב-**Neon Postgres** (המחיר מחושב מחדש בצד השרת —
     לעולם לא נסמכים על מחיר שמגיע מהדפדפן);
   - יוצר מיד **דראפט ב-Gelato** (`orderType: "draft"`) ושומר את
     `gelato_order_id` — הדראפט מופיע ב-Gelato Dashboard אבל לא מחויב
     ולא מודפס עד אישור;
   - אם `STRIPE_SECRET_KEY` מוגדר — ממשיך ל-Stripe Checkout; אחרת ההזמנה
     מסתיימת מיד (מצב ללא-תשלום עד שמחברים Stripe).
4. **`/api/stripe/webhook`** — כש-Stripe שולח `checkout.session.completed`,
   ההזמנה מסומנת כ-`paid`, ונשלח מייל אישור (Resend).
5. **אישור לייצור הוא תמיד ידני**: בעמוד `/admin/orders/[id]` יש כפתור
   "אשר לייצור והדפסה" שממיר את הדראפט להזמנה אמיתית ב-Gelato (עם אישור
   נוסף בדפדפן, ואזהרה אם ההזמנה לא שולמה).

## 3. מסד נתונים ואחסון (Vercel)

הוקם ב-2026-07-06 דרך Vercel Marketplace, מחובר לפרויקט `shirts`:

- **Neon Postgres** (`vercel install neon`) — טבלת `orders`. הסכימה ב-
  `db/schema.sql`; להרצה מחדש: `npm run db:migrate` (קורא `DATABASE_URL`
  מ-`.env.local`).
- **Vercel Blob** (store בשם `shirts-files`, public) — קבצי עיצוב ו-mockups.
  ה-URLs ציבוריים אך עם סיומת אקראית בלתי-ניתנת-לניחוש, מה שמאפשר ל-Gelato
  למשוך את קובץ ההדפסה ישירות בלי Signed URLs.

כדי למשוך את משתני הסביבה לפיתוח מקומי: `vercel env pull .env.local`
(ואז להוסיף חזרה את הסודות שאינם ב-Vercel, אם חסרים).

## 4. משתני סביבה (`.env.local`)

העתיקו את `.env.example` ל-`.env.local` ומלאו:

| משתנה | היכן משתמשים | הערה |
|---|---|---|
| `DATABASE_URL` | שרת בלבד | **סודי** — Neon Postgres (נוצר ע"י Vercel) |
| `BLOB_READ_WRITE_TOKEN` | שרת בלבד | **סודי** — Vercel Blob (נוצר ע"י Vercel) |
| `STRIPE_SECRET_KEY` | שרת בלבד | **סודי**; אם ריק — האתר במצב ללא-תשלום |
| `STRIPE_WEBHOOK_SECRET` | שרת בלבד | מ-`stripe listen` בפיתוח, מה-Dashboard בפרודקשן |
| `GELATO_API_KEY` | שרת בלבד | **סודי** — ר' סעיף 5 למטה |
| `ADMIN_PASSWORD` | שרת בלבד | סיסמת הכניסה לעמוד `/admin` |
| `ADMIN_SESSION_SECRET` | שרת בלבד | מחרוזת אקראית ארוכה (`openssl rand -hex 32`) |
| `RESEND_API_KEY` / `EMAIL_FROM` | שרת בלבד | לשליחת מייל אישור הזמנה |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | דפדפן | לכפתור הוואטסאפ הצף, פורמט בינלאומי ללא `+` |

## 5. איפה לשים את ה-Gelato API Key ולמה זה בטוח

`GELATO_API_KEY` **חייב** להישאר משתנה סביבה בצד השרת בלבד (`.env.local` /
משתני הסביבה בפלטפורמת האחסון — לא `NEXT_PUBLIC_*`). הוא נקרא אך ורק בתוך
`lib/gelato.ts`, שמסומן ב-`import "server-only"` — אם מישהו ינסה בטעות
לייבא את הקובץ הזה מקומפוננטת לקוח (`"use client"`), ה-build ייכשל באופן
מפורש. הקריאה בפועל ל-API של Gelato מתבצעת מתוך `app/api/gelato/send/route.ts`
(Route Handler שרץ בשרת בלבד), ורק אחרי שבדקנו ב-DB ש-`payment_status === "paid"`.

## 6. הרצה מקומית

```bash
npm install
cp .env.example .env.local   # ומלאו את הערכים
npm run dev
```

האתר יעלה על http://localhost:3000 (או פורט חלופי אם 3000 תפוס).

## 7. בדיקת הזמנה — למה זה בטוח

- כל הזמנה באתר יוצרת **דראפט בלבד** ב-Gelato: מופיע ב-Dashboard, לא מחויב
  ולא נשלח לייצור. אפשר להזמין באתר בחופשיות לצורך בדיקות.
- הייצור מתחיל רק כשמאשרים ידנית ב-`/admin/orders/[id]` ("אשר לייצור
  והדפסה"), עם דיאלוג אישור ואזהרה אם ההזמנה לא שולמה.
- דראפטים מיותרים אפשר למחוק ב-Gelato Dashboard.
- לבדיקת תשלום כשמחברים Stripe: כרטיס בדיקה `4242 4242 4242 4242`, כל
  תוקף עתידי, כל CVC, עם `stripe listen --forward-to
  localhost:3000/api/stripe/webhook`.

## 8. סטטוס חיבור Gelato

**החיבור בוצע ואומת ב-2026-07-06** מול ה-API האמיתי:

- ✅ `GELATO_API_KEY` מוגדר ב-`.env.local` ואומת (קריאת קטלוג הצליחה).
- ✅ `productUid` אמיתיים: הקוד ב-`lib/gelato.ts` בונה אותם דינמית בתבנית
  `apparel_product_gca_t-shirt_gsc_crewneck_gcu_{cut}_gqa_classic_gsi_{size}_gco_{color}_gpr_4-0`
  (הדפסה קדמית בצבע מלא). כל 44 שילובי גזרה/צבע/מידה שהאתר מוכר אומתו
  ב-GET מול ה-Product API. מיפוי: גברים→unisex, נשים→womens, ילדים→kids;
  כחול→navy; XXL→2xl. **אין XXL לילדים** — חסום גם ב-UI וגם בשרת.
- ✅ משלוח לישראל אומת דרך `orders:quote` (לא נוצרה הזמנה): ייצור בצ'כיה,
  DHL Express Worldwide DDU ‏39.83 ₪ / 4–8 ימים. עלות חולצה בודדת: 38.60 ₪.
  ברירת המחדל בקוד היא `express` (זול ומהיר יותר מ-normal לישראל);
  ניתן לעקוף עם `GELATO_SHIPMENT_METHOD`.

**מה עדיין נשאר:**

1. **Webhook** — בהגדרות ה-Webhooks ב-Gelato Dashboard, להצביע ל-
   `https://<הדומיין-שלכם>/api/gelato/webhook` (דורש דומיין ציבורי, כלומר
   אחרי פריסה). מיפוי הסטטוסים ב-`app/api/gelato/webhook/route.ts` הוא
   ניחוש סביר — לאמת מול הערכים האמיתיים שמגיעים ולעדכן את
   `mapFulfillmentStatus` בהתאם.
2. אם Gelato חותם את בקשות ה-webhook (secret/signature) — להוסיף אימות
   בתחילת ה-route, יש placeholder מסומן בקוד.
3. לוודא **אמצעי תשלום/חיוב בחשבון Gelato** — ההזמנות דרך ה-API מחויבות
   לחשבון Gelato שלכם.

## 9. פריסה לפרודקשן

- הגדירו את כל משתני הסביבה בפלטפורמת האחסון (Vercel וכו').
- ודאו ש-`STRIPE_SECRET_KEY` הוא מפתח `live` (לא `test`) ושה-Webhook
  ב-Stripe Dashboard מצביע ל-`https://<הדומיין>/api/stripe/webhook` עם
  ה-`STRIPE_WEBHOOK_SECRET` המתאים לפרודקשן.
- שנו את `ADMIN_PASSWORD` ו-`ADMIN_SESSION_SECRET` לערכים אמיתיים וחזקים.
