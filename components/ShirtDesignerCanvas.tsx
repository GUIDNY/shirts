"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { ShirtColor, PrintSide, DesignTransform } from "@/lib/types";
import { COLOR_HEX } from "@/lib/types";
import { FLAT_ASSETS, STAGE_WIDTH, STAGE_HEIGHT } from "@/lib/studio";

export { STAGE_WIDTH, STAGE_HEIGHT };

export interface ShirtDesignerCanvasHandle {
  exportMockup: () => string;
}

interface Props {
  color: ShirtColor;
  side: PrintSide;
  imageUrl: string | null;
  transform: DesignTransform | null;
  onTransformChange: (t: DesignTransform) => void;
}

/**
 * Photorealistic shirt designer over a studio photo.
 *
 * Garment layer: the white-shirt cutout, tinted to the selected fabric color
 * with a multiply rect masked back to the cutout's alpha — one photo serves
 * every color. Design layer: the artwork, the white cutout multiplied over it
 * (fabric folds shade the print), masked back to the artwork's alpha.
 * Each stack lives in its own Konva layer so the composite ops stay isolated.
 */
const ShirtDesignerCanvas = forwardRef<ShirtDesignerCanvasHandle, Props>(function ShirtDesignerCanvas(
  { color, side, imageUrl, transform, onTransformChange },
  ref
) {
  const asset = FLAT_ASSETS[side];
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

  const [cutoutImg] = useImage(asset.cutout);
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

  return (
    <Stage
      ref={stageRef}
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      className="rounded-lg overflow-hidden touch-none"
      onMouseDown={(e) => {
        if (e.target === e.target.getStage() || e.target.name() === "garment") setSelected(false);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage() || e.target.name() === "garment") setSelected(false);
      }}
    >
      {/* studio background */}
      <Layer listening={false}>
        <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="#eceef0" />
      </Layer>

      {/* tinted garment */}
      <Layer>
        {cutoutImg && (
          <>
            <KonvaImage name="garment" image={cutoutImg} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
            <Rect
              x={0}
              y={0}
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              fill={COLOR_HEX[color]}
              listening={false}
              globalCompositeOperation="multiply"
            />
            <KonvaImage
              image={cutoutImg}
              width={STAGE_WIDTH}
              height={STAGE_HEIGHT}
              listening={false}
              globalCompositeOperation="destination-in"
            />
          </>
        )}
      </Layer>

      {/* print-area guide */}
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

      {/* design shaded by fabric folds */}
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
            {cutoutImg && (
              <KonvaImage
                image={cutoutImg}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                listening={false}
                globalCompositeOperation="multiply"
              />
            )}
            <KonvaImage {...designNodeProps} listening={false} globalCompositeOperation="destination-in" />
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
