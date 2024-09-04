import { useEffect, useState } from 'react';
import { StyleSheet, Image as RNImage, Button, useWindowDimensions, Platform } from 'react-native';
import { Tensor, TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import {
  launchImageLibrary,
} from 'react-native-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Canvas, Rect, Text, Skia, SkImage, Image as SKImage, matchFont, Group } from '@shopify/react-native-skia';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';

const resizeImage = async (uri: string, width: number, height: number) => {
  try {
    const response = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0, undefined, true, { mode: 'stretch' });
    console.log(response.height + 'x' + response.width, ' img');
    return response.uri;
  } catch (err) {
    console.error(err);
    return null;
  }
};

function iou(box1: any, box2: any) {
  const res = intersection(box1, box2) / union(box1, box2);
  return res;
}

function RGBAtoRGB(
  r: number, 
  g: number, 
  b: number, 
  a: number, 
  r2: number, 
  g2: number, 
  b2: number
){
  console.log(
    r,
    g,
    b,
    a,
    r2,
    g2,
    b2
  )
  const al = 1 - a
  const r3 = Math.round((a * (r) + (al * (r2))) * 255);
  const g3 = Math.round((a * (g) + (al * (g2))) * 255);
  const b3 = Math.round((a * (b) + (al * (b2))) * 255);

  return [
    r3, 
    g3, 
    b3
  ];
} 

function union(box1: any, box2: any) {
  const { x1: box1_x1, y1: box1_y1, x2: box1_x2, y2: box1_y2 } = box1;
  const { x1: box2_x1, y1: box2_y1, x2: box2_x2, y2: box2_y2 } = box2;
  const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1);
  const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1);
  return box1_area + box2_area - intersection(box1, box2);
}

function intersection(box1: any, box2: any) {
  const { x1: box1_x1, y1: box1_y1, x2: box1_x2, y2: box1_y2 } = box1;
  const { x1: box2_x1, y1: box2_y1, x2: box2_x2, y2: box2_y2 } = box2;
  const x1 = Math.max(box1_x1, box2_x1);
  const y1 = Math.max(box1_y1, box2_y1);
  const x2 = Math.min(box1_x2, box2_x2);
  const y2 = Math.min(box1_y2, box2_y2);
  return (x2 - x1) * (y2 - y1);
}

function scale(maxWidth: number, maxHeight: number, srcWidth: number | undefined, srcHeight: number | undefined) {
  if (!srcWidth || !srcHeight) return { height: 0, width: 0 };
  let width = 0;
  let height = 0;
  if (srcWidth > srcHeight) {
    if (srcWidth > maxWidth) {
      height = Math.round(srcHeight * (maxWidth / srcWidth));
      width = Math.round(maxWidth);
    }
  } else {
    if (srcHeight > maxHeight) {
      width = Math.round(srcWidth * (maxHeight / srcHeight));
      height = Math.round(maxHeight);
    }
  }

  return {
    width,
    height
  }
}

const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });

const fontStyle = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};

const font = matchFont(fontStyle as any);

function getColor(label: string) {
  switch (label) {
    case '0':
      return "lightblue";
      break;

    case 'n1':
    case 'n2':
      return "blue";
      break;

    case '0':
      return "lightblue";
      break;

    case '1':
    case '2':
    case '3':
      return "green";
      break;

    case '10':
    case '11':
    case '12':
      return "red";
      break;

    default:
      return "yellow";
      break;
  }
}

function tensorToString(tensor: Tensor): string {
  return ` - ${tensor.dataType} ${tensor.name}[${tensor.shape}]`;
}

function modelToString(model: TensorflowModel): string {
  return (`
  TFLite Model (${model.delegate}):
  ${model.inputs.map(tensorToString).join('')} (inputs)
  ${model.outputs.map(tensorToString).join('')} (outputs)
  `);
}

export default function HomeScreen() {
  const model = useTensorflowModel(require('@/assets/models/sumjo8su_float32.tflite'));
  const actualModel = model.state === 'loaded' ? model.model : undefined;
  useEffect(() => {
    if (actualModel == null) return
  }, [actualModel]);

  const [img, setImg] = useState<SkImage | null>();
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<any>([]);
  const { height: wHeight, width: wWidth } = useWindowDimensions();
  const detectionTreshold = .05;

  useEffect(() => {
    if (!img) return;
    setImgSize(scale(wWidth - 48, (wHeight / 2) - 48, img?.width(), img?.height()));
  }, [img]);

  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1, includeBase64: true },
      async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
            const uri = response.assets[0]?.uri;
            const data = await Skia.Data.fromURI(uri);
            if (!data) return;
            const image = Skia.Image.MakeImageFromEncoded(data);
            if (!image) return;
            setImg(image);
            const resized = await resizeImage(uri, 640, 640);
            if (!resized) return;
            const dataResized = await Skia.Data.fromURI(resized);
            const imageResized = Skia.Image.MakeImageFromEncoded(dataResized);
            if (!imageResized) return;
            const pixelsResized = imageResized.readPixels(0, 0, imageResized.getImageInfo());
            if (!pixelsResized) return;
            
            let oRGB = [];
          
            for (let index = 0; index < pixelsResized.length; index += 4) {
              oRGB.push(pixelsResized[index] / 255);
              oRGB.push(pixelsResized[index + 1] / 255);
              oRGB.push(pixelsResized[index + 2] / 255);

              //omited alpha value : pixelsResized[index + 3]
            }
            
            const arrayBuffer = new Float32Array(oRGB);
            
            const result = actualModel?.runSync([arrayBuffer]);
            if (!result || result.length < 1) return;
            const outputTensor = result[0];
            const numDetections = 8400;
            let boxes: any = [];
            const yolo_classes = ['0', '1', '10', '11', '12', '2', '3', '4', '5', '6', '7', '8', '9', 'n1', 'n2'];
            for (let index = 0; index < numDetections; index++) {
              const [class_id, prob] =
                [...Array(15).keys()].map((col) => {
                  return [col, outputTensor[numDetections * (col + 4) + index]]
                }).reduce((accum, item) =>
                  item[1] > accum[1] ? item : accum
                );

              if (prob < detectionTreshold) {
                continue;
              }

              const label = yolo_classes[Number(class_id)];
              const x = outputTensor[index] as Float;
              const y = outputTensor[numDetections + index] as Float;
              const w = outputTensor[2 * numDetections + index] as Float;
              const h = outputTensor[3 * numDetections + index] as Float;

              boxes.push({
                label,
                prob,
                xsize: {
                  x: x, y: y, w: w, h: h
                },
              });
            }

            boxes = boxes.sort((boxA: any, boxB: any) => boxB.prob - boxA.prob).sort((boxA: any, boxB: any) => boxB.label - boxA.label);

            const output = [];
            setBoxes(boxes);
            while (boxes.length > 0) {
              output.push(boxes[0]);
              boxes = boxes.filter((box: any) => iou(boxes[0].xsize, box.xsize) < 0.9 || boxes[0].label !== box.label);
            }
          }
        } else {
          console.log(response.errorMessage);
        }
      });
  };
console.log(imgSize)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <RNImage
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={{ flex: 1, alignItems: 'center' }}>
        <Button title='Launch gallery' onPress={uploadImage} />
        {img && boxes &&
          <Canvas style={{ width: imgSize.width, height: imgSize.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={img} fit='contain' x={0} y={0} width={imgSize.width} height={imgSize.height} />
            {boxes.map((box: any, index: number) =>
              <Group key={`detection-box-${index}-${box.label}`}>
                <Text color={getColor(box.label)} text={box.label} x={(box.xsize.x * imgSize.width)} y={((box.xsize.y * imgSize.height) - 4)} font={font} />
                <Rect 
                  x={(box.xsize.x - box.xsize.w / 2) * imgSize.width} y={(box.xsize.y - box.xsize.h / 2) * imgSize.height} 
                  width={box.xsize.w * imgSize.width} height={box.xsize.h * imgSize.height} 
                  strokeCap='square' strokeWidth={2} strokeMiter={3} strokeJoin={'round'} 
                  style='stroke' color={getColor(box.label)} opacity={box.prob} 
                />
              </Group>
            )}
          </Canvas>
        }
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
