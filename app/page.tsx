import Link from "next/link";
import Image from "next/image";
import { LogoMark } from "@/components/Logo";

const CHECKS = ["בלי עלות התחלה", "בלי מינימום הזמנה", "משלוח מהיר ואמין"];

const FEATURES = [
  { title: "עורך עיצוב קל", desc: "גוררים, מגדילים ומסובבים — בלי ניסיון קודם" },
  { title: "6 צבעים ומידות", desc: "S עד XXL, לגברים, נשים וילדים" },
  { title: "משלוח מהיר", desc: "מדפיסים ושולחים תוך ימים בודדים" },
  { title: "איכות מובטחת", desc: "לא מרוצים? מחזירים כסף" },
];

const STEPS = [
  { title: "מעלים עיצוב", desc: "לוגו או תמונה מהמחשב או מהנייד" },
  { title: "בוחרים מוצר", desc: "סוג, צבע, מידה וכמות" },
  { title: "אנחנו מדפיסים ושולחים", desc: "ישירות עד הבית" },
];

const PRODUCTS: { src: string; label: string; price: string }[] = [
  { src: "/studio/model-men.jpg", label: "חולצת גברים", price: "מ-89 ₪" },
  { src: "/studio/model-women.jpg", label: "חולצת נשים", price: "מ-89 ₪" },
  { src: "/studio/model-kids.jpg", label: "חולצת ילדים", price: "מ-89 ₪" },
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
        <div className="border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center lg:text-right">
                <h3 className="font-semibold text-white text-sm md:text-base">{f.title}</h3>
                <p className="text-xs md:text-sm text-neutral-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Products */}
      <section id="products" className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-14">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            איך זה <span className="brand-gradient-text">עובד</span>
          </h2>
          <p className="text-neutral-500 mb-10">מתחילים תוך שלושה צעדים פשוטים.</p>

          <div className="flex flex-col gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="shrink-0 h-10 w-10 rounded-full brand-gradient-bg text-white flex items-center justify-center font-bold">
                  {i + 1}
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
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">מוצרים פופולריים</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.src}
                href="/design"
                className="rounded-xl border border-neutral-200 overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-shadow group"
              >
                <div className="relative aspect-[3/4] bg-neutral-100">
                  <Image
                    src={p.src}
                    alt={p.label}
                    fill
                    className="object-cover group-hover:scale-[1.03] transition-transform"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <p className="font-medium text-neutral-900 text-sm">{p.label}</p>
                  <p className="text-sm text-neutral-500">{p.price}</p>
                </div>
              </Link>
            ))}

            <div className="rounded-xl border border-dashed border-neutral-300 flex flex-col items-center justify-center aspect-[3/4] text-center p-4 bg-neutral-50">
              <span className="text-2xl mb-2">🧥</span>
              <p className="font-medium text-neutral-700 text-sm">קפוצ&apos;ונים</p>
              <p className="text-xs text-neutral-400 mt-1">בקרוב</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
