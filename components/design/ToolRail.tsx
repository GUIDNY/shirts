"use client";

const ROADMAP_TOOLS = [
  { icon: "🔤", label: "טקסט" },
  { icon: "◇", label: "צורות ואייקונים" },
  { icon: "🖼️", label: "גלריית גרפיקות" },
  { icon: "🎨", label: "תבניות מוכנות" },
];

export default function ToolRail({
  uploadLabel,
  onFileChange,
}: {
  uploadLabel: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 border-l border-white/10 flex-col gap-2 p-4">
      <label className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-4 cursor-pointer hover:bg-violet-500/15 transition-colors text-center">
        <span className="text-xl">⬆️</span>
        <span className="text-sm font-medium text-white">{uploadLabel}</span>
        <span className="text-xs text-neutral-400">PNG/JPG, עד 20MB</span>
        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFileChange} />
      </label>

      <div className="h-px bg-white/10 my-2" />

      {ROADMAP_TOOLS.map((tool) => (
        <div
          key={tool.label}
          className="flex items-center gap-3 rounded-lg px-3 py-3 opacity-40 cursor-not-allowed relative"
        >
          <span className="text-lg">{tool.icon}</span>
          <span className="text-sm text-neutral-300">{tool.label}</span>
          <span className="absolute left-3 text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-neutral-400">
            בקרוב
          </span>
        </div>
      ))}
    </aside>
  );
}
