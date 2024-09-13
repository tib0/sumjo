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