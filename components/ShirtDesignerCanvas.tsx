"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import type { ProductType, ShirtColor, DesignTransform } from "@/lib/types";
import { shirtSvgDataUrl, SHIRT_VIEWBOX_WIDTH, SHIRT_VIEWBOX_HEIGHT, PRINT_AREA } from "@/lib/shirtSvg";

export const STAGE_WIDTH = 320;
export const STAGE_HEIGHT = Math.round(
  (STAGE_WIDTH / SHIRT_VIEWBOX_WIDTH) * SHIRT_VIEWBOX_HEIGHT
);
const SCALE = STAGE_WIDTH / SHIRT_VIEWBOX_WIDTH;

const PRINT_AREA_PX = {
  x: PRINT_AREA.x * SCALE,
  y: PRINT_AREA.y * SCALE,
  width: PRINT_AREA.width * SCALE,
  height: PRINT_AREA.height * SCALE,
};

export interface ShirtDesignerCanvasHandle {
  exportMockup: () => string;
}

interface Props {
  color: ShirtColor;
  productType: ProductType;
  imageUrl: string | null;
  transform: DesignTransform | null;
  onTransformChange: (t: DesignTransform) => void;
}

const ShirtDesignerCanvas = forwardRef<ShirtDesignerCanvasHandle, Props>(function ShirtDesignerCanvas(
  { color, productType, imageUrl, transform, onTransformChange },
  ref
) {
  const stageRef = useRef<Konva.Stage>(null);
  const guideLayerRef = useRef<Konva.Layer>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [selected, setSelected] = useState(false);

  const [shirtImg] = useImage(shirtSvgDataUrl(color, productType));
  const [designImg] = useImage(imageUrl || "", "anonymous");

  useEffect(() => {
    if (selected && trRef.current && imageNodeRef.current) {
      trRef.current.nodes([imageNodeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, designImg]);

  useEffect(() => {
    if (designImg && !transform) {
      const maxW = PRINT_AREA_PX.width;
      const maxH = PRINT_AREA_PX.height;
      const scale = Math.min(maxW / designImg.width, maxH / designImg.height, 1) * 0.95;
      onTransformChange({
        x: STAGE_WIDTH / 2,
        y: STAGE_HEIGHT / 2,
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

  return (
    <Stage
      ref={stageRef}
      width={STAGE_WIDTH}
      height={STAGE_HEIGHT}
      className="rounded-lg border border-neutral-200 bg-neutral-50 touch-none"
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) setSelected(false);
      }}
    >
      <Layer listening={false}>
        {shirtImg && <KonvaImage image={shirtImg} width={STAGE_WIDTH} height={STAGE_HEIGHT} />}
      </Layer>

      <Layer ref={guideLayerRef} listening={false}>
        <Rect
          x={PRINT_AREA_PX.x}
          y={PRINT_AREA_PX.y}
          width={PRINT_AREA_PX.width}
          height={PRINT_AREA_PX.height}
          stroke="#93c5fd"
          dash={[6, 4]}
          strokeWidth={1.5}
        />
      </Layer>

      <Layer>
        {designImg && transform && (
          <>
            <KonvaImage
              ref={imageNodeRef}
              image={designImg}
              width={designImg.width}
              height={designImg.height}
              offsetX={designImg.width / 2}
              offsetY={designImg.height / 2}
              x={transform.x}
              y={transform.y}
              scaleX={transform.scaleX}
              scaleY={transform.scaleY}
              rotation={transform.rotation}
              draggable
              onClick={() => setSelected(true)}
              onTap={() => setSelected(true)}
              onDragEnd={(e) => {
                onTransformChange({ ...transform, x: e.target.x(), y: e.target.y() });
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
            {selected && (
              <Transformer
                ref={trRef}
                rotateEnabled
                keepRatio
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
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
