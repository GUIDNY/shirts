# חולצה אישית — הדפסה על חולצות בעיצוב אישי

אתר הזמנות לחולצות מודפסות לפי דרישה. Next.js 16 (App Router) + TypeScript + Tailwind
CSS v4, Supabase (DB + Storage), Stripe Checkout, ו-Konva לעורך העיצוב האינטראקטיבי.
מוכן לחיבור ל-Gelato API להדפסה ומשלוח אוטומטיים.

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
│     ├─ upload/route.ts              העלאת קובץ עיצוב + mockup ל-Supabase Storage
│     ├─ checkout/route.ts            יצירת הזמנה (pending) + Stripe Checkout Session
│     ├─ stripe/webhook/route.ts      אישור תשלום מ-Stripe → מסמן הזמנה כ"שולם"
│     ├─ gelato/send/route.ts         (אדמין) שליחת הזמנה משולמת ל-Gelato
│     ├─ gelato/webhook/route.ts      קליטת עדכוני סטטוס מ-Gelato
│     └─ admin/login|logout, admin/orders/[id]/status   ניהול הרשאות וסטטוס
├─ components/                        Header, Footer, WhatsAppButton, CartProvider,
│                                      ShirtSvg, ShirtDesignerCanvas (Konva), admin/*
├─ lib/
│  ├─ types.ts, pricing.ts, shirtSvg.ts
│  ├─ supabase/client.ts              קליינט ציבורי (anon key) — לדפדפן
│  ├─ supabase/server.ts              קליינט שרת (service role key) — שרת בלבד
│  ├─ stripe.ts, email.ts, auth.ts
│  └─ gelato.ts                       שירות Gelato — createGelatoOrder()
├─ supabase/schema.sql                טבלת orders + buckets + RLS
├─ proxy.ts                           הגנת /admin (שם חדש ל-middleware ב-Next.js 16)
└─ .env.example
```

## 2. איך זה עובד

1. **`/design`** — הלקוח בוחר סוג מוצר / צבע / מידה, מעלה תמונה, וממקם אותה על
   קנבס Konva (גרירה להזזה, ידיות בפינות להגדלה/הקטנה/סיבוב). בלחיצה על
   "המשך להזמנה", התמונה המקורית ותמונת ה-mockup המורכבת (`stage.toDataURL()`)
   נשלחות ל-`/api/upload` ומאוחסנות ב-Supabase Storage.
2. **`/cart`** ו-**`/checkout`** — עריכת כמות ופרטי משלוח (נשמר ב-localStorage
   דרך `CartProvider`).
3. בלחיצה על "המשך לתשלום", `/api/checkout` יוצר **שורת הזמנה ב-DB עם
   `payment_status = pending`**, ואז יוצר Stripe Checkout Session ומפנה אליו.
   המחיר מחושב מחדש בצד השרת (`lib/pricing.ts`) — לעולם לא נסמכים על מחיר
   שמגיע מהדפדפן.
4. **`/api/stripe/webhook`** — כש-Stripe שולח `checkout.session.completed`,
   ההזמנה מסומנת כ-`paid`, ונשלח מייל אישור (Resend).
5. **`/thank-you/[orderId]`** — מציג את מספר ההזמנה. אם ה-webhook עדיין לא
   הגיע (יכול לקרות בסביבת פיתוח בלי `stripe listen`), העמוד בודק ישירות מול
   Stripe כגיבוי.
6. **הזמנה ל-Gelato נשלחת רק ידנית** מתוך `/admin/orders/[id]` בלחיצה על
   "שלח ל-Gelato" — אף פעם לא אוטומטית, ורק אם `payment_status === "paid"`.

## 3. הגדרת Supabase

1. צרו פרויקט חדש ב-[supabase.com](https://supabase.com).
2. פתחו את ה-SQL Editor והריצו את הקובץ `supabase/schema.sql` — זה יוצר את
   טבלת `orders`, את ה-bucket הפרטי `designs` ואת ה-bucket הציבורי `mockups`.
3. מ-Project Settings > API, העתיקו את `URL`, `anon public key` ו-
   `service_role key` ל-`.env.local`.

**חשוב על אבטחה**: bucket `designs` (קבצי העיצוב המקוריים) נשאר **פרטי**.
כל גישה אליו (גם בעמוד הניהול) מתבצעת דרך Signed URL שנוצר בזמן אמת בשרת
(`createSignedUrl`), ולא דרך URL ציבורי קבוע.

## 4. משתני סביבה (`.env.local`)

העתיקו את `.env.example` ל-`.env.local` ומלאו:

| משתנה | היכן משתמשים | הערה |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | דפדפן + שרת | ציבורי, מותר בצד לקוח |
| `SUPABASE_SERVICE_ROLE_KEY` | שרת בלבד | **סודי**, לעולם לא לדפדפן |
| `STRIPE_SECRET_KEY` | שרת בלבד | **סודי** |
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

## 7. בדיקת הזמנה בדמו — בלי לשלוח באמת ל-Gelato

זה כבר מובנה בעיצוב המערכת:

- **Gelato אף פעם לא נקרא אוטומטית.** גם אחרי תשלום מוצלח, ההזמנה רק
  מסומנת `paid` — אין קריאה ל-Gelato עד שלוחצים ידנית על "שלח ל-Gelato"
  בעמוד `/admin/orders/[id]`.
- כדי לבדוק את כל הזרימה (עיצוב → סל → תשלום → אישור) בלי לגעת ב-Gelato כלל:
  1. הריצו `stripe listen --forward-to localhost:3000/api/stripe/webhook`
     (צריך [Stripe CLI](https://docs.stripe.com/stripe-cli)) כדי לקבל את
     `STRIPE_WEBHOOK_SECRET` ולוודא שה-webhook מגיע.
  2. בצעו הזמנה מלאה באתר, ובתשלום ב-Stripe Checkout השתמשו בכרטיס בדיקה
     `4242 4242 4242 4242`, כל תאריך תוקף עתידי, כל CVC.
  3. תגיעו ל-`/thank-you/...` עם "ההזמנה התקבלה בהצלחה", ותוכלו לראות אותה
     ב-`/admin` עם `payment_status = paid`.
  4. **אל תלחצו** על "שלח ל-Gelato" אלא אם `GELATO_API_KEY` ומיפוי המוצרים
     (סעיף הבא) מוגדרים באמת — עד אז הכפתור יחזיר שגיאה ברורה במקום לשלוח
     נתונים לא תקינים.

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
