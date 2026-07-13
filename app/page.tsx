import Link from "next/link";
import Image from "next/image";
import ProductCarousel, { type CarouselItem } from "@/components/ProductCarousel";
import { CANVAS_PRICE, MUG_PRICE, POSTER_PRICE, TOTE_PRICE } from "@/lib/types";
import { UNIT_PRICE } from "@/lib/pricing";

const CHECKS = ["בלי עלות התחלה", "בלי מינימום הזמנה", "משלוח מהיר ואמין"];

const FEATURES = [
  {
    title: "עורך עיצוב קל",
    desc: "גוררים, מגדילים ומסובבים — בלי ניסיון קודם",
    icon: (
      <path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    ),
  },
  {
    title: "6 צבעים ומידות",
    desc: "S עד XXL, לגברים, נשים וילדים",
    icon: <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.6" fill="none" />,
  },
  {
    title: "משלוח מהיר",
    desc: "מדפיסים ושולחים תוך ימים בודדים",
    icon: (
      <>
        <path d="M3 7h10v9H3z" stroke="white" strokeWidth="1.6" fill="none" />
        <path d="M13 10h4l3 3v3h-7z" stroke="white" strokeWidth="1.6" fill="none" />
        <circle cx="7" cy="18" r="1.6" stroke="white" strokeWidth="1.3" fill="none" />
        <circle cx="17" cy="18" r="1.6" stroke="white" strokeWidth="1.3" fill="none" />
      </>
    ),
  },
  {
    title: "איכות מובטחת",
    desc: "לא מרוצים? מחזירים כסף",
    icon: (
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

const STEPS = [
  { title: "מעלים עיצוב", desc: "לוגו או תמונה מהמחשב או מהנייד" },
  { title: "בוחרים מוצר", desc: "סוג, צבע, מידה וכמות" },
  { title: "אנחנו מדפיסים ושולחים", desc: "ישירות עד הבית" },
];

const POPULAR_PRODUCTS: { href: string; src: string; label: string; price: string }[] = [
  { href: "/design", src: "/studio/model-men.jpg", label: "חולצת גברים", price: `מ-${UNIT_PRICE} ₪` },
  { href: "/design", src: "/studio/model-women.jpg", label: "חולצת נשים", price: `מ-${UNIT_PRICE} ₪` },
  { href: "/design", src: "/studio/model-kids.jpg", label: "חולצת ילדים", price: `מ-${UNIT_PRICE} ₪` },
];

const MORE_PRODUCTS: CarouselItem[] = [
  {
    href: "/design/poster",
    label: "פוסטר בעיצוב אישי",
    price: `מ-${POSTER_PRICE.glossy} ₪`,
    visual: (
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full h-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center">
          <span className="text-neutral-400 text-xs">50×70</span>
        </div>
      </div>
    ),
  },
  {
    href: "/design/tote",
    images: ["/studio/tote-blank.jpg", "/studio/tote-blank-2.jpg"],
    alt: "טוט בג בעיצוב אישי",
    label: "טוט בג בעיצוב אישי",
    price: `מ-${TOTE_PRICE} ₪`,
  },
  {
    href: "/design/canvas",
    images: ["/studio/canvas-blank.jpg", "/studio/canvas-blank-2.jpg"],
    alt: "קנבס בעיצוב אישי",
    label: "קנבס בעיצוב אישי",
    price: `מ-${CANVAS_PRICE} ₪`,
  },
  {
    href: "/design/mug",
    images: ["/studio/mug-blank.jpg", "/studio/mug-blank-2.jpg"],
    alt: "ספל בעיצוב אישי",
    label: "ספל בעיצוב אישי",
    price: `מ-${MUG_PRICE} ₪`,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative w-full h-[78vh] md:h-[88vh] min-h-[520px] flex items-center overflow-hidden bg-[#0a0a0f]">
        <div className="absolute inset-0">
          <Image
            src="/studio/hero-store.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/55 to-transparent md:hidden" />
          <div className="absolute inset-0 hidden md:block bg-gradient-to-l from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="max-w-md mx-auto text-center lg:mx-0 lg:text-right">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              עצבו. הדפיסו.
              <br />
              <span className="brand-gradient-text">קבלו הביתה.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-neutral-300 max-w-md mx-auto lg:mx-0">
              הפלטפורמה שלכם לחולצות מודפסות בעיצוב אישי. מעלים תמונה, אנחנו מטפלים בשאר.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3">
              <Link
                href="/design"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md brand-gradient-bg text-white text-base font-semibold hover:brightness-110 transition-all w-full sm:w-auto"
              >
                התחילו לעצב
              </Link>
              <Link
                href="#products"
                className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-white/25 text-white text-base font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                צפו בדוגמאות
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2">
              {CHECKS.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-sm text-neutral-200">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l4 4 8-8.5"
                      stroke="#c3c0ff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-[#0a0a0f]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center lg:items-end text-center lg:text-right">
                <div className="h-11 w-11 rounded-full brand-gradient-bg flex items-center justify-center mb-3 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-sm md:text-base">{f.title}</h3>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[700px] mx-auto px-4 md:px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          איך זה <span className="brand-gradient-text">עובד</span>
        </h2>
        <p className="text-neutral-500 mb-10">מתחילים תוך שלושה צעדים פשוטים.</p>

        <div className="flex flex-col sm:flex-row items-start justify-center gap-6 sm:gap-4 text-right sm:text-center">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex sm:flex-col items-start sm:items-center gap-4 flex-1 max-w-[220px]">
              <div className="shrink-0 flex sm:flex-col items-center">
                <div className="h-10 w-10 rounded-full brand-gradient-bg text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/design"
          className="mt-10 inline-flex items-center justify-center h-12 px-8 rounded-md brand-gradient-bg text-white text-base font-semibold hover:brightness-110 transition-all"
        >
          התחילו לעצב עכשיו
        </Link>
      </section>

      {/* Products */}
      <section id="products" className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="flex justify-between items-end mb-10 border-b border-neutral-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold">מוצרים פופולריים</h2>
          <Link href="/design" className="text-sm font-medium text-violet-600 hover:underline flex items-center gap-1">
            לכל הקולקציה
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
          {POPULAR_PRODUCTS.map((p) => (
            <Link key={p.src} href={p.href} className="group block rounded-lg overflow-hidden">
              <div className="relative aspect-[4/5] bg-neutral-100 rounded-lg overflow-hidden">
                <Image
                  src={p.src}
                  alt={p.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="pt-4 pb-2">
                <h3 className="font-medium text-neutral-900 group-hover:text-violet-600 transition-colors">{p.label}</h3>
                <p className="text-lg font-bold text-neutral-900 mt-1">{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* More products carousel */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24">
          <ProductCarousel title="עוד מוצרים לעיצוב אישי" items={MORE_PRODUCTS} />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#0a0a0f] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 0%, #8b5cf6, transparent 60%)" }}
        />
        <div className="relative max-w-[700px] mx-auto px-4 md:px-6 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            מוכנים לעצב <span className="brand-gradient-text">חולצה משלכם?</span>
          </h2>
          <p className="mt-4 text-neutral-400">מעלים עיצוב, בוחרים צבע ומידה — אנחנו מדפיסים ושולחים עד הבית.</p>
          <Link
            href="/design"
            className="mt-8 inline-flex items-center justify-center h-12 px-10 rounded-md brand-gradient-bg text-white text-base font-semibold hover:brightness-110 transition-all"
          >
            התחילו לעצב בחינם
          </Link>
        </div>
      </section>
    </div>
  );
}
