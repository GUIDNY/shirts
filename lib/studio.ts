import type { PrintSide, ProductType } from "./types";

/**
 * Photographic studio assets. Every garment ships as a WHITE photo plus a
 * shirt-only cutout PNG; any fabric color is produced client-side by a
 * multiply tint masked to the cutout (COLOR_HEX in types.ts), so one photo
 * serves all six colors. Print boxes are fractions of the image (0..1),
 * measured against a 10% calibration grid.
 */
export interface StudioAsset {
  /** Full photo (base). For flat tees this is empty — the cutout IS the base. */
  base: string | null;
  /** Shirt-only cutout PNG (transparent outside the garment). */
  cutout: string;
  print: { x: number; y: number; w: number; h: number };
}

/** Flat ghost-mannequin views — the interactive editor base, front and back. */
export const FLAT_ASSETS: Record<PrintSide, StudioAsset> = {
  front: {
    base: null,
    cutout: "/studio/cut-tee-front.png",
    print: { x: 0.3, y: 0.27, w: 0.4, h: 0.45 },
  },
  back: {
    base: null,
    cutout: "/studio/cut-tee-back.png",
    print: { x: 0.3, y: 0.26, w: 0.4, h: 0.48 },
  },
};

/** Model photos (wearing white) keyed by product type — the "on a person" preview. */
export const MODEL_ASSETS: Record<ProductType, StudioAsset> = {
  men: {
    base: "/studio/model-men.jpg",
    cutout: "/studio/cut-model-men.png",
    print: { x: 0.32, y: 0.4, w: 0.36, h: 0.29 },
  },
  women: {
    base: "/studio/model-women.jpg",
    cutout: "/studio/cut-model-women.png",
    print: { x: 0.34, y: 0.4, w: 0.32, h: 0.29 },
  },
  kids: {
    base: "/studio/model-kids.jpg",
    cutout: "/studio/cut-model-kids.png",
    print: { x: 0.32, y: 0.42, w: 0.36, h: 0.3 },
  },
};

/** Editor stage keeps the photos' 3:4 aspect ratio. */
export const STAGE_WIDTH = 360;
export const STAGE_HEIGHT = 480;
