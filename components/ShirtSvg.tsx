import type { ProductType, ShirtColor } from "@/lib/types";
import { COLOR_HEX } from "@/lib/types";
import { SHIRT_PATH, SHIRT_VIEWBOX_WIDTH, SHIRT_VIEWBOX_HEIGHT } from "@/lib/shirtSvg";

export default function ShirtSvg({
  color,
  productType,
  className,
}: {
  color: ShirtColor;
  productType?: ProductType;
  className?: string;
}) {
  const fill = COLOR_HEX[color];
  const stroke = color === "white" ? "#d4d4d4" : "rgba(0,0,0,0.15)";
  const scaleX = productType === "women" ? 0.92 : 1;
  const scaleY = productType === "kids" ? 0.86 : 1;

  return (
    <svg viewBox={`0 0 ${SHIRT_VIEWBOX_WIDTH} ${SHIRT_VIEWBOX_HEIGHT}`} className={className} aria-hidden="true">
      <g transform={`translate(120 150) scale(${scaleX} ${scaleY}) translate(-120 -150)`}>
        <path d={SHIRT_PATH} fill={fill} stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        {productType === "women" && (
          <path
            d="M78 90 C90 140 90 200 82 260"
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            opacity={0.5}
          />
        )}
      </g>
    </svg>
  );
}
