"use client";

import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { ShirtColor, DesignTransform } from "@/lib/types";
import { MODEL_ASSETS, TEE_ASSETS, STAGE_WIDTH, STAGE_HEIGHT } from "@/lib/studio";

interface Props {
  color: ShirtColor;
  imageUrl: string | null;
  /** The user's transform from the flat-tee editor (stage coordinates). */
  transform: DesignTransform | null;
  width?: number;
}

/**
 * Non-interactive "on a person" preview. The design placement is mapped
 * from the flat tee's print box to the model photo's print box, so moving
 * or scaling the artwork in the editor updates the model preview live.
 * Fabric blending matches the editor (multiply on light, screen on dark).
 */
export default function ModelPreview({ color, imageUrl, transform, width = 360 }: Props) {
  const height = Math.round((width * STAGE_HEIGHT) / STAGE_WIDTH);

  const modelAsset = MODEL_ASSETS[color];
  const teePrint = TEE_ASSETS[color].print;

  const [modelImg] = useImage(modelAsset.src);
  const [designImg] = useImage(imageUrl || "", "anonymous");

  let designProps = null;
  if (designImg && transform) {
    // normalize the editor transform relative to the flat tee's print box
    const teeBox = {
      x: teePrint.x * STAGE_WIDTH,
      y: teePrint.y * STAGE_HEIGHT,
      w: teePrint.w * STAGE_WIDTH,
      h: teePrint.h * STAGE_HEIGHT,
    };
    const relX = (transform.x - teeBox.x) / teeBox.w;
    const relY = (transform.y - teeBox.y) / teeBox.h;
    const relScale = transform.scaleX / teeBox.w; // scale per print-box-width unit

    const modelBox = {
      x: modelAsset.print.x * width,
      y: modelAsset.print.y * height,
      w: modelAsset.print.w * width,
      h: modelAsset.print.h * height,
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

  const fabricBlend = modelAsset.fabric === "light" ? "multiply" : "screen";

  return (
    <Stage width={width} height={height} listening={false} className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
      <Layer listening={false}>
        {modelImg && <KonvaImage image={modelImg} width={width} height={height} />}
      </Layer>
      <Layer listening={false}>
        {designProps && (
          <>
            <KonvaImage {...designProps} />
            {modelImg && (
              <KonvaImage
                image={modelImg}
                width={width}
                height={height}
                globalCompositeOperation={fabricBlend}
                opacity={modelAsset.fabric === "light" ? 1 : 0.9}
              />
            )}
            <KonvaImage {...designProps} globalCompositeOperation="destination-in" />
          </>
        )}
      </Layer>
    </Stage>
  );
}
