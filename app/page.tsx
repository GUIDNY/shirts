import Link from "next/link";
import Image from "next/image";

const STEPS = [
  { title: "מעלים תמונה", desc: "בוחרים לוגו או תמונה מהמחשב או מהנייד" },
  { title: "בוחרים חולצה", desc: "סוג, צבע, מידה וכמות" },
  { title: "משלמים בביטחון", desc: "תשלום מאובטח באשראי" },
  { title: "מקבלים עד הבית", desc: "הדפסה ומשלוח ישירות אליכם" },
];

const EXAMPLES: { src: string; label: string }[] = [
  { src: "/studio/tee-white.jpg", label: "חולצה לבנה" },
  { src: "/studio/tee-black.jpg", label: "חולצה שחורה" },
  { src: "/studio/tee-blue.jpg", label: "חולצה כחולה" },
];

export default function HomePage() {
  return (
    <div>
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 pt-14 pb-10 md:pt-20 md:pb-16 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
          הדפסה על חולצות בעיצוב אישי
        </h1>
        <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-xl mx-auto">
          מעלים תמונה, בוחרים חולצה, משלמים, מקבלים עד הבית.
        </p>
        <div className="mt-8">
          <Link
            href="/design"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-neutral-900 text-white text-base font-semibold hover:bg-neutral-800 transition-colors"
          >
            התחל לעצב
          </Link>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-3 h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <h3 className="font-semibold text-neutral-900">{step.title}</h3>
              <p className="text-sm text-neutral-600 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-14">
        <h2 className="text-2xl font-bold text-center mb-10">דוגמאות עיצוב</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.src}
              className="rounded-lg border border-neutral-200 overflow-hidden flex flex-col items-center hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)] transition-shadow"
            >
              <div className="relative w-full aspect-[3/4]">
                <Image src={ex.src} alt={ex.label} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
              </div>
              <p className="py-4 font-medium text-neutral-900">{ex.label}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/design"
            className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-blue-900 text-white text-base font-semibold hover:brightness-110 transition-all"
          >
            עצבו את החולצה שלכם
          </Link>
        </div>
      </section>
    </div>
  );
}
