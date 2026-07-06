import type { ProductType, ShirtColor } from "./types";
import { COLOR_HEX } from "./types";

export const SHIRT_PATH =
  "M100 20 L140 20 L165 45 L200 35 L215 75 L185 92 L185 260 C185 270 178 276 168 276 L72 276 C62 276 55 270 55 260 L55 92 L25 75 L40 35 L75 45 Z";

export const SHIRT_VIEWBOX_WIDTH = 240;
export const SHIRT_VIEWBOX_HEIGHT = 300;

/** Print-safe area (in the same 240x300 viewBox coordinate space) where the design may be placed. */
export const PRINT_AREA = { x: 65, y: 90, width: 110, height: 130 };

function scaleForProduct(productType: ProductType): { scaleX: number; scaleY: number } {
  return {
    scaleX: productType === "women" ? 0.92 : 1,
    scaleY: productType === "kids" ? 0.86 : 1,
  };
}

export function shirtSvgMarkup(color: ShirtColor, productType: ProductType): string {
  const fill = COLOR_HEX[color];
  const stroke = color === "white" ? "#d4d4d4" : "rgba(0,0,0,0.15)";
  const { scaleX, scaleY } = scaleForProduct(productType);

  const waistLine =
    productType === "women"
      ? `<path d="M78 90 C90 140 90 200 82 260" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="0.5" />`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SHIRT_VIEWBOX_WIDTH} ${SHIRT_VIEWBOX_HEIGHT}" width="${SHIRT_VIEWBOX_WIDTH}" height="${SHIRT_VIEWBOX_HEIGHT}">
    <g transform="translate(120 150) scale(${scaleX} ${scaleY}) translate(-120 -150)">
      <path d="${SHIRT_PATH}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" />
      ${waistLine}
    </g>
  </svg>`;
}

export function shirtSvgDataUrl(color: ShirtColor, productType: ProductType): string {
  const markup = shirtSvgMarkup(color, productType);
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;
}
