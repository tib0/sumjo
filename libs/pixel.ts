import { CoordBox } from "@/types/Sumjo";

export function iou(box1: CoordBox, box2: CoordBox): number {
  'worklet'
  const { x1: box1_x1, y1: box1_y1, x2: box1_x2, y2: box1_y2 } = box1;
  const { x1: box2_x1, y1: box2_y1, x2: box2_x2, y2: box2_y2 } = box2;

  const x1 = Math.max(box1_x1, box2_x1);
  const y1 = Math.max(box1_y1, box2_y1);
  const x2 = Math.min(box1_x2, box2_x2);
  const y2 = Math.min(box1_y2, box2_y2);

  const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1);
  const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1);

  return ((x2 - x1) * (y2 - y1)) / (box1_area + box2_area - ((x2 - x1) * (y2 - y1)));
}

export function scale(
  maxWidth: number,
  maxHeight: number,
  srcWidth: number | undefined,
  srcHeight: number | undefined
): {
  width: number, height: number
} {
  if (!srcWidth || !srcHeight) return { height: 0, width: 0 };
  let width = 0;
  let height = 0;
  width = Math.round(maxWidth);
  height = Math.round(maxHeight);
  console.log(maxWidth,
    maxHeight,
    srcWidth,
    srcHeight)
  /* if (srcWidth > srcHeight) {
    if (srcWidth > maxWidth) {
      height = Math.round(srcHeight * (maxWidth / srcWidth));
      width = Math.round(maxWidth);
    } else {
      width = Math.round(maxWidth);
      height = Math.round(maxHeight);
    }
  } else {
    if (srcHeight > maxHeight) {
      width = Math.round(srcWidth * (maxHeight / srcHeight));
      height = Math.round(maxHeight);
    } else {
      if (srcHeight > srcWidth) {
        width = Math.round(maxWidth * (maxHeight / srcHeight));
        height = Math.round(maxHeight);
      } else {
        width = Math.round(maxWidth);
        height = Math.round(maxHeight * (maxWidth / srcWidth));
      }
    }
  } */

  return {
    width,
    height
  }
}