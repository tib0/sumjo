import { type Tensor, type TensorflowModel } from "react-native-fast-tflite";
import { getRGBArrayFromUri, resizeImage } from "./image";
import { iou } from "./pixel";
import { SUMJO_CLASSES, SUMJO_TRESHOLD } from "@/constants/Sumjo";
import { DetectionBox } from "@/types/Sumjo";
import * as MediaLibrary from 'expo-media-library';
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
  
  await MediaLibrary.saveToLibraryAsync(resized);

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
  const numDetections = 8400;
  let boxes: DetectionBox[] = [];
   for (let index = 0; index < numDetections; index++) {
    const [class_id, prob] =
      [...Array(15).keys()].map((col) => {
        return [col, outputTensor[numDetections * (col + 4) + index]]
      }).reduce((accum, item) =>
        item[1] > accum[1] ? item : accum
      );

    if (prob < SUMJO_TRESHOLD) {
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
      xSize: {
        x, y, w, h
      },
      xCoordinate: {
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
    /* boxes = boxes.map((box: DetectionBox) => {
      if (iou(boxes[0].xCoordinate, box.xCoordinate) < 0.7 && boxes[0].label == box.label) {
        boxes[0].prob = (boxes[0].prob + box.prob / 2);
      }
      return box;
    }) */
    boxes = boxes.filter((box: DetectionBox) => {
      return iou(boxes[0].xCoordinate, box.xCoordinate) < 0.7;
    });
  }

  return output.sort((boxA: DetectionBox, boxB: DetectionBox) => boxB.prob - boxA.prob).slice(0, 12);
}