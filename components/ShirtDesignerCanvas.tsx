"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { ShirtColor, DesignTransform } from "@/lib/types";
import { TEE_ASSETS, STAGE_WIDTH, STAGE_HEIGHT } from "@/lib/studio";

export { STAGE_WIDTH, STAGE_HEIGHT };

export interface ShirtDesignerCanvasHandle {
  exportMockup: () => string;
}

interface Props {
  color: ShirtColor;
  imageUrl: string | null;
  transform: DesignTransform | null;
  onTransformChange: (t: DesignTransform) => void;
}

/**
 * Photorealistic shirt designer.
 *
 * The design layer renders three synced nodes so the artwork inherits the
 * garment's fabric folds:
 *   1. the design image (user transform applied)
 *   2. the base garment photo blended over it — "multiply" on light fabric
 *      (folds darken the print), "screen" on dark fabric (highlights sheen)
 *   3. the design image again with "destination-in", masking the blend back
 *      to the design's own alpha so the rest of the print area is untouched.
 * The layer has its own canvas, so these ops never affect the photo below.
 */
const ShirtDesignerCanvas = forwardRef<ShirtDesignerCanvasHandle, Props>(function ShirtDesignerCanvas(
  { color, imageUrl, transform, onTransformChange },
  ref
) {
  const asset = TEE_ASSETS[color];
  const printPx = {
    x: asset.print.x * STAGE_WIDTH,
    y: asset.print.y * STAGE_HEIGHT,
    width: asset.print.w * STAGE_WIDTH,
    height: asset.print.h * STAGE_HEIGHT,
  };

  const stageRef = useRef<Konva.Stage>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [selected, setSelected] = useState(false);

  const [shirtImg] = useImage(asset.src);
  const [designImg] = useImage(imageUrl || "", "anonymous");

  useEffect(() => {
    if (selected && trRef.current && imageNodeRef.current) {
      trRef.current.nodes([imageNodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, designImg]);

  useEffect(() => {
    if (designImg && !transform) {
      const scale = Math.min(printPx.width / designImg.width, printPx.height / designImg.height) * 0.85;
      onTransformChange({
        x: printPx.x + printPx.width / 2,
        y: printPx.y + printPx.height * 0.42,
        scaleX: scale,
        scaleY: scale,
        rotation: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designImg]);

  useImperativeHandle(ref, () => ({
    exportMockup: () => {
      const guideLayer = guideLayerRef.current;
      const wasVisible = guideLayer?.visible();
      guideLayer?.visible(false);
      trRef.current?.nodes([]);
      stageRef.current?.draw();
      const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 }) || "";
      guideLayer?.visible(wasVisible ?? true);
      if (selected && imageNodeRef.current) trRef.current?.nodes([imageNodeRef.current]);
      stageRef.current?.draw();
      return dataUrl;
    },
  }));

  const designNodeProps = designImg && transform
    ? {
        image: designImg,
        width: designImg.width,
        height: designImg.height,
        offsetX: designImg.width / 2,
        offsetY: designImg.height / 2,
        x: transform.x,
        y: transform.y,
        scaleX: transform.scaleX,
        scaleY: transform.scaleY,
        rotation: transform.rotation,
      }
    : null;

  const fabricBlend = asset.fabric === "light" ? "multiply" : "screen";

  return (
    <Stage
      ref={stageRef}
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 touch-none"
      onMouseDown={(e) => {
        if (e.target === e.target.getStage() || e.target.name() === "base-photo") setSelected(false);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage() || e.target.name() === "base-photo") setSelected(false);
      }}
    >
      <Layer listening={false}>
        {shirtImg && (
          <KonvaImage name="base-photo" image={shirtImg} width={STAGE_WIDTH} height={STAGE_HEIGHT} listening />
        )}
      </Layer>

      <Layer ref={guideLayerRef} listening={false}>
        <Rect
          x={printPx.x}
          y={printPx.y}
          width={printPx.width}
          height={printPx.height}
          stroke="#93c5fd"
          dash={[6, 4]}
          strokeWidth={1.5}
        />
      </Layer>

      <Layer>
        {designNodeProps && (
          <>
            <KonvaImage
              ref={imageNodeRef}
              {...designNodeProps}
              draggable
              onClick={() => setSelected(true)}
              onTap={() => setSelected(true)}
              onDragEnd={(e) => {
                onTransformChange({
                  ...(transform as DesignTransform),
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e) => {
                const node = e.target;
                onTransformChange({
                  x: node.x(),
                  y: node.y(),
                  scaleX: node.scaleX(),
                  scaleY: node.scaleY(),
                  rotation: node.rotation(),
                });
              }}
            />
            {shirtImg && (
              <KonvaImage
                image={shirtImg}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                listening={false}
                globalCompositeOperation={fabricBlend}
                opacity={asset.fabric === "light" ? 1 : 0.9}
              />
            )}
            <KonvaImage
              {...designNodeProps}
              listening={false}
              globalCompositeOperation="destination-in"
            />
            {selected && (
              <Transformer
                ref={trRef}
                rotateEnabled
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20 || newBox.height < 20) return oldBox;
                  return newBox;
                }}
              />
            )}
          </>
        )}
      </Layer>
    </Stage>
  );
});

export default ShirtDesignerCanvas;
