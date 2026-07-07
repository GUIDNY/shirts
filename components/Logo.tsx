const MARK_PATH_TOP = "M8 16 L92 16 L74 34 L26 34 Z";
const MARK_PATH_STEM = "M40 34 L60 34 L54 88 L36 88 Z";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="teevo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx="24" fill="url(#teevo-gradient)" />
      <path d={MARK_PATH_TOP} fill="white" />
      <path d={MARK_PATH_STEM} fill="white" />
    </svg>
  );
}

export default function Logo({
  size = 32,
  wordmarkClassName = "text-white",
}: {
  size?: number;
  wordmarkClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className={`text-lg font-extrabold tracking-tight ${wordmarkClassName}`}>TEEVO</span>
    </span>
  );
}
