import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/Logo";
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

const FEATURED_PRODUCTS: { src: string; label: string; price: string }[] = [
  { src: "/studio/model-men.jpg", label: "חולצת גברים", price: `מ-${UNIT_PRICE} ₪` },
  { src: "/studio/model-kids.jpg", label: "חולצת ילדים", price: `מ-${UNIT_PRICE} ₪` },
];

const MORE_PRODUCTS: CarouselItem[] = [
  { href: "/design", src: "/studio/model-women.jpg", alt: "חולצת נשים", label: "חולצת נשים", price: `מ-${UNIT_PRICE} ₪` },
  {
    href: "/design/poster",
    label: "פוסטר בעיצוב אישי",
    price: `מ-${POSTER_PRICE.glossy} ₪`,
    visual: (
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
        <div className="w-[55%] aspect-[5/7] bg-white shadow-lg" />
      </div>
    ),
  },
  { href: "/design/tote", src: "/studio/tote-blank.jpg", alt: "טוט בג בעיצוב אישי", label: "טוט בג בעיצוב אישי", price: `מ-${TOTE_PRICE} ₪` },
  { href: "/design/canvas", src: "/studio/canvas-blank.jpg", alt: "קנבס בעיצוב אישי", label: "קנבס בעיצוב אישי", price: `מ-${CANVAS_PRICE} ₪` },
  { href: "/design/mug", src: "/studio/mug-blank.jpg", alt: "ספל בעיצוב אישי", label: "ספל בעיצוב אישי", price: `מ-${MUG_PRICE} ₪` },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[#0a0a0f] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="text-center lg:text-right">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              עצבו. הדפיסו.
              <br />
              <span className="brand-gradient-text">קבלו הביתה.</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-neutral-400 max-w-md mx-auto lg:mx-0">
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
                className="inline-flex items-center justify-center h-12 px-8 rounded-md border border-white/15 text-white text-base font-semibold hover:bg-white/5 transition-colors w-full sm:w-auto"
              >
                צפו בדוגמאות
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-end gap-x-6 gap-y-2">
              {CHECKS.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 text-sm text-neutral-300">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M4 10.5l4 4 8-8.5"
                      stroke="#8b5cf6"
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

          <div className="relative w-full aspect-[4/3] max-w-[480px] mx-auto">
            <div
              className="absolute inset-0 blur-3xl opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(circle at 65% 35%, #8b5cf6, transparent 60%)" }}
            />
            <div
              className="absolute inset-0 blur-3xl opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle at 25% 75%, #3b82f6, transparent 60%)" }}
            />

            <div className="absolute right-[6%] top-[4%] w-[52%] rotate-[7deg] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="relative aspect-[3/4]">
                <Image src="/studio/tee-white.jpg" alt="חולצה לבנה" fill className="object-cover" sizes="30vw" />
              </div>
            </div>

            <div className="absolute left-[2%] bottom-[2%] w-[60%] -rotate-[5deg] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <div className="relative aspect-[3/4]">
                <Image src="/studio/tee-black.jpg" alt="חולצה שחורה עם עיצוב TEEVO" fill className="object-cover" sizes="35vw" />
                <div
                  className="absolute flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl"
                  style={{ left: "50%", top: "43%", transform: "translate(-50%, -50%)" }}
                >
                  <LogoMark size={22} />
                  <span className="text-white font-extrabold text-sm tracking-tight">TEEVO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-16 md:pb-24">
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
      <section id="products" className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">מוצרים פופולריים</h2>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {FEATURED_PRODUCTS.map((p) => (
              <Link
                key={p.src}
                href="/design"
                className="rounded-xl border border-neutral-200 overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-shadow group bg-white"
              >
                <div className="relative aspect-[4/5] bg-neutral-100">
                  <Image
                    src={p.src}
                    alt={p.label}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform"
                    sizes="(max-width: 768px) 50vw, 40vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium text-neutral-900">{p.label}</p>
                  <p className="text-sm text-neutral-500">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <h3 className="text-sm font-medium text-neutral-500 mt-10 mb-4">עוד מוצרים לעיצוב אישי</h3>
          <ProductCarousel items={MORE_PRODUCTS} />
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
