import type { ShirtColor } from "./types";

/**
 * Photographic studio assets (AI-generated product/model photography) and
 * their calibrated print areas. All print-box values are fractions of the
 * image dimensions (0..1), measured against a 10% calibration grid.
 */
export interface StudioAsset {
  src: string;
  /** Print-safe area on the garment, as fractions of the image. */
  print: { x: number; y: number; w: number; h: number };
  /** "light" fabric darkens the print (multiply); "dark" adds highlights (screen). */
  fabric: "light" | "dark";
}

/** Flat ghost-mannequin product shots — the interactive editor base. */
export const TEE_ASSETS: Record<ShirtColor, StudioAsset> = {
  white: {
    src: "/studio/tee-white.jpg",
    print: { x: 0.3, y: 0.27, w: 0.4, h: 0.45 },
    fabric: "light",
  },
  black: {
    src: "/studio/tee-black.jpg",
    print: { x: 0.3, y: 0.27, w: 0.4, h: 0.45 },
    fabric: "dark",
  },
  blue: {
    src: "/studio/tee-blue.jpg",
    print: { x: 0.3, y: 0.27, w: 0.4, h: 0.45 },
    fabric: "dark",
  },
};

/** Model photos wearing a matching plain tee — the "on a person" preview. */
export const MODEL_ASSETS: Record<ShirtColor, StudioAsset> = {
  white: {
    src: "/studio/model-white.jpg",
    print: { x: 0.32, y: 0.4, w: 0.36, h: 0.29 },
    fabric: "light",
  },
  black: {
    src: "/studio/model-black.jpg",
    print: { x: 0.33, y: 0.37, w: 0.34, h: 0.3 },
    fabric: "dark",
  },
  blue: {
    src: "/studio/model-blue.jpg",
    print: { x: 0.32, y: 0.43, w: 0.36, h: 0.28 },
    fabric: "dark",
  },
};

/** Editor stage keeps the photos' 3:4 aspect ratio. */
export const STAGE_WIDTH = 360;
export const STAGE_HEIGHT = 480;
