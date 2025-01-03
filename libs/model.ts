import { type Tensor, type TensorflowModel } from "react-native-fast-tflite";
import { getRGBArrayFromUri, resizeImage } from "./image";
import { iou } from "./pixel";
import { SUMJO_CLASSES, SUMJO_PROB_TRESHOLD, SUMJO_IOU_TRESHOLD, SUMJO_DETECTIONS } from "@/constants/Sumjo";
import { DetectionBox } from "@/types/Sumjo";
import { IMAGE_DETECTION_HEIGHT, IMAGE_DETECTION_WIDTH } from "@/constants/Image";

export function tensorToString(tensor: Tensor): string {
  return ` - ${tensor.dataType} ${tensor.name}[${tensor.shape}]`;
}

export function modelToString(model: TensorflowModel): string {
  return (`
    TFLite Model (${model.delegate}):
    ${model.inputs.map(tensorToString).join('')} (inputs)
    ${model.outputs.map(tensorToString).join('')} (outputs)
  `);
}

export async function performDetectionFromUri(model: TensorflowModel, uri: string): Promise<DetectionBox[]> {
  const resized = await resizeImage(uri, IMAGE_DETECTION_WIDTH, IMAGE_DETECTION_HEIGHT);
  if (!resized) return [];

  const oRGB = await getRGBArrayFromUri(resized);
  if (!oRGB || oRGB.length < 1) return [];
  const arrayBuffer = new Float32Array(oRGB);

  return performDetectionFromArray(model, arrayBuffer);
}

export function performDetectionFromArray(model: TensorflowModel, arrayBuffer: Float32Array): DetectionBox[] {
  'worklet'
  const result = model?.runSync([arrayBuffer]);
  if (!result || result.length < 1) return [];
  const outputTensor = result[0];
  const numDetections = SUMJO_DETECTIONS;
  let boxes: DetectionBox[] = [];
  for (let index = 0; index < numDetections; index++) {
    const [class_id, prob] =
      [...Array(SUMJO_CLASSES.length).keys()].map((col) => {
        return [col, outputTensor[numDetections * (col + 4) + index]]
      }).reduce((accum, item) =>
        item[1] > accum[1] ? item : accum
      );

    if (prob < SUMJO_PROB_TRESHOLD) {
      continue;
    }

    const label = SUMJO_CLASSES[Number(class_id)];
    const x = outputTensor[index] as number;
    const y = outputTensor[numDetections + index] as number;
    const w = outputTensor[2 * numDetections + index] as number;
    const h = outputTensor[3 * numDetections + index] as number;


    const x1 = (x - (w / 2));
    const y1 = (y - (h / 2));
    const x2 = (x + (w / 2));
    const y2 = (y + (h / 2));

    boxes.push({
      label,
      prob,
      coordinates: {
        x1, y1, x2, y2
      },
    } as DetectionBox);
  }

  boxes = boxes
    .sort((boxA: DetectionBox, boxB: DetectionBox) => boxB.prob - boxA.prob)
    .sort((boxA: DetectionBox, boxB: DetectionBox) => boxB.label.localeCompare(boxA.label));

  let output = [];
  while (boxes.length > 0) {
    output.push(boxes[0]);
    boxes = boxes.filter((box: DetectionBox) => {
      if (boxes[0].label !== box.label) return true;
      const boxIoU = iou(boxes[0].coordinates, box.coordinates);
      return boxIoU < SUMJO_IOU_TRESHOLD || boxIoU > 1;
    });
  }

  return output.sort((boxA: DetectionBox, boxB: DetectionBox) => boxB.prob - boxA.prob).slice(0, 12);
}