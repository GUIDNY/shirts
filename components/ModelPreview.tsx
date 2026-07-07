"use client";

import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import type { ProductType, ShirtColor, DesignTransform } from "@/lib/types";
import { COLOR_HEX } from "@/lib/types";
import { MODEL_ASSETS, FLAT_ASSETS, STAGE_WIDTH, STAGE_HEIGHT } from "@/lib/studio";

interface Props {
  productType: ProductType;
  color: ShirtColor;
  imageUrl: string | null;
  /** The user's front transform from the flat editor (stage coordinates). */
  transform: DesignTransform | null;
  width?: number;
}

/**
 * Non-interactive "on a person" preview. The model is picked by product type
 * (man/woman/kid) and the shirt is tinted to the selected color, so switching
 * gender keeps the color — like Gelato's product page. The front design is
 * mapped from the flat editor's print box onto the model's chest.
 */
export default function ModelPreview({ productType, color, imageUrl, transform, width = 360 }: Props) {
  const height = Math.round((width * STAGE_HEIGHT) / STAGE_WIDTH);

  const asset = MODEL_ASSETS[productType];
  const teePrint = FLAT_ASSETS.front.print;

  const [baseImg] = useImage(asset.base || "");
  const [cutoutImg] = useImage(asset.cutout);
  const [designImg] = useImage(imageUrl || "", "anonymous");

  let designProps = null;
  if (designImg && transform) {
    const teeBox = {
      x: teePrint.x * STAGE_WIDTH,
      y: teePrint.y * STAGE_HEIGHT,
      w: teePrint.w * STAGE_WIDTH,
      h: teePrint.h * STAGE_HEIGHT,
    };
    const relX = (transform.x - teeBox.x) / teeBox.w;
    const relY = (transform.y - teeBox.y) / teeBox.h;
    const relScale = transform.scaleX / teeBox.w;

    const modelBox = {
      x: asset.print.x * width,
      y: asset.print.y * height,
      w: asset.print.w * width,
      h: asset.print.h * height,
    };
    const scale = relScale * modelBox.w;

    designProps = {
      image: designImg,
      width: designImg.width,
      height: designImg.height,
      offsetX: designImg.width / 2,
      offsetY: designImg.height / 2,
      x: modelBox.x + relX * modelBox.w,
      y: modelBox.y + relY * modelBox.h,
      scaleX: scale,
      scaleY: scale * (transform.scaleY / transform.scaleX || 1),
      rotation: transform.rotation,
    };
  }

  return (
    <Stage
      width={width}
      height={height}
      listening={false}
      className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50"
    >
      <Layer listening={false}>
        {baseImg && <KonvaImage image={baseImg} width={width} height={height} />}
      </Layer>

      {/* tint the white shirt to the selected color */}
      <Layer listening={false}>
        {cutoutImg && (
          <>
            <KonvaImage image={cutoutImg} width={width} height={height} />
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={COLOR_HEX[color]}
              globalCompositeOperation="multiply"
            />
            <KonvaImage
              image={cutoutImg}
              width={width}
              height={height}
              globalCompositeOperation="destination-in"
            />
          </>
        )}
      </Layer>

      {/* design shaded by fabric folds */}
      <Layer listening={false}>
        {designProps && (
          <>
            <KonvaImage {...designProps} />
            {cutoutImg && (
              <KonvaImage
                image={cutoutImg}
                width={width}
                height={height}
                globalCompositeOperation="multiply"
              />
            )}
            <KonvaImage {...designProps} globalCompositeOperation="destination-in" />
          </>
        )}
      </Layer>
    </Stage>
  );
}
