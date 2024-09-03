import { useEffect, useState } from 'react';
import { StyleSheet, Image as RNImage, Button, useWindowDimensions, Platform } from 'react-native';
import { Tensor, TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import {
  launchImageLibrary,
} from 'react-native-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
import { Canvas, Rect, Text, Skia, SkImage, Image as SKImage, matchFont, Group, AlphaType, ColorType } from '@shopify/react-native-skia';
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
//import RNImageManipulator from "@oguzhnatly/react-native-image-manipulator";
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';

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
      height = srcHeight * (maxWidth / srcWidth);
      width = maxWidth;
    }
  } else {
    if (srcHeight > maxHeight) {
      width = srcWidth * (maxHeight / srcHeight);
      height = maxHeight;
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
  const [img2, setImg2] = useState<SkImage | null>();
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [img2Size, setImg2Size] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<any>([]);
  const [array, setArray] = useState<any>();
  const [imageSkia, setImageSkia] = useState<any>();
  const { height: wHeight, width: wWidth } = useWindowDimensions();
  const detectionTreshold = .2;

  console.log(`Model: ${model.state} (${model.model != null})`);

  useEffect(() => {
    if (!img) return;
    if (!img2) return;
    setImgSize(scale(wWidth - 48, (wHeight / 2) - 48, img?.width(), img?.height()));
    setImg2Size(scale(wWidth - 48, (wHeight / 2) - 48, img2?.width(), img2?.height()));
  }, [img, img2]);

  useEffect(() => {
    if (!array) return;
    const dataSkia = Skia.Data.fromBytes(array);  
    const image = Skia.Image.MakeImage(
      {
        width: 640,
        height: 640,
        colorType: ColorType.RGB_565,   //ColorType.RGBA_8888,   //ColorType.RGB_565,
        alphaType:AlphaType.Opaque,
      },
      dataSkia,
      640 * 3
    );
    
    // const imageRGBA = Skia.Image.MakeImage(
    //   {
    //     width: 640,
    //     height: 640,
    //     colorType: ColorType.RGBA_8888,   //ColorType.RGBA_8888,   //ColorType.RGB_565,
    //     alphaType:AlphaType.Opaque,
    //   },
    //   dataSkia,
    //   640 * 4
    // );

    console.log('useEffect', image?.width(), image?.height())
    console.log('useEffect', array.length)
    setImageSkia(image);
  }, [array]);

  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo'/* , maxHeight: 640, maxWidth: 640 */, quality: 1, includeBase64: true },
      async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
            const data = await Skia.Data.fromURI(response.assets[0]?.uri);
            const image = Skia.Image.MakeImageFromEncoded(data);
            if (!image) return;
            console.log('uploadImage 1', image?.width(),image?.height())
            setImg(image);
            const resized = await resizeImage(response.assets[0].uri, 640, 640);
            if (!resized) return;
            const data2 = await Skia.Data.fromURI(resized);
            const image2 = Skia.Image.MakeImageFromEncoded(data2);
            if (!image2) return;
            console.log('uploadImage 2', image2?.width(),image2?.height())
            setImg2(image2);
            const pixels2 = image2.readPixels(0, 0, image2.getImageInfo());
            if (!pixels2) return;
            
            // const RNImage = await manipulateAsync(
            //   resized,
            //   [{resize: { width: 640, height: 640 }}],
            //   { compress: 1, format: SaveFormat.JPEG, base64: true }
            // );

            // const convertedArray = await convertToRGB(RNImage.uri);
            // const resized3 = await resizeImage(RNImage?.uri, 640, 640);
            // if (!resized3) return; 
            // const convertedArray3 = await convertToRGB(resized3);
            
            let a = [];
            let oRGBA = [];
            let oRGB = [];
            let oR = [];
            let oG = [];
            let oB = [];
            let oR2 = [];
            let oG2 = [];
            let oB2 = [];
          
            for (let index = 0; index < pixels2.length; index += 4) {
              oRGBA.push(pixels2[index]);
              oRGBA.push(pixels2[index + 1]);
              oRGBA.push(pixels2[index + 2]);
              oRGBA.push(pixels2[index + 3]);

              oRGB.push(pixels2[index]);
              oRGB.push(pixels2[index + 1]);
              oRGB.push(pixels2[index + 2]);

              oR.push((pixels2[index] / 255) as Float);
              oG.push((pixels2[index + 1] / 255) as Float);
              oB.push((pixels2[index + 2] / 255) as Float);

              oR2.push(pixels2[index]);
              oG2.push(pixels2[index + 1]);
              oB2.push(pixels2[index + 2]);

              a.push((pixels2[index + 3] / 255) as Float);

              if (index%42000 == 0 || index == 0) {
                console.log(
                  pixels2[index],
                  pixels2[index + 1],
                  pixels2[index + 2],
                  pixels2[index + 3]
                );
              }
            }
            
            const finalArray = [...oR, ...oG, ...oB];
            const pixels = new Uint8Array(oRGB);
            setArray(pixels);
            console.log('pixels[0]', pixels[0])
            console.log(oRGB.length)
            console.log('oRGB[0]', oRGB[0])
            console.log(pixels.length)
            const arrayBuffer = new Float32Array(finalArray);
            console.log(arrayBuffer[0])
            console.log(arrayBuffer.length)
            const result = actualModel?.runSync([arrayBuffer]);
            if (!result || result.length < 1) return;
            const outputTensor = result[0];
            const numDetections = 8400;
            let boxes: any = [];
            const yolo_classes = ['0', '1', '10', '11', '12', '2', '3', '4', '5', '6', '7', '8', '9', 'n1', 'n2'];
            const wh = scale(wWidth - 48, (wHeight *.3) - 48, image?.width(), image?.height());
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

            boxes = boxes.sort((boxA: any, boxB: any) => boxB.prob - boxA.prob);

            const output = [];
            setBoxes(boxes);
            while (boxes.length > 0) {
              output.push(boxes[0]);
              boxes = boxes.filter((box: any) => /* iou(boxes[0].xsize, box.xsize) < 0.7 ||  */boxes[0].label !== box.label);
            }
          }
        } else {
          console.log(response.errorMessage);
        }
      });
  };

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
        {img2 && boxes &&
          <Canvas style={{ width: img2Size.width, height: img2Size.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={img2} fit='contain' x={0} y={0} width={img2Size.width} height={img2Size.height} />
            {boxes.map((box: any, index: number) =>
              <Group key={`detection-box-${index}-${box.label}`}>
                <Text color={getColor(box.label)} text={box.label} x={(box.xsize.x * 300)} y={((box.xsize.y * 300) - 4)} font={font} />
                <Rect x={(box.xsize.x * 300)} y={(box.xsize.y * 300)} width={box.xsize.w * 300} height={box.xsize.h * 300} strokeCap='square' strokeWidth={2} strokeMiter={3} strokeJoin={'round'} style='stroke' color={getColor(box.label)} opacity={box.prob} />
              </Group>
            )}
          </Canvas>
        }
          
        {imageSkia && boxes &&
          <Canvas style={{ width: img2Size.width, height: img2Size.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={imageSkia} fit='contain' x={0} y={0} width={img2Size.width} height={img2Size.height} />
          </Canvas>
        }

        {img && boxes &&
          <Canvas style={{ width: imgSize.width, height: imgSize.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={img} fit='contain' x={0} y={0} width={imgSize.width} height={imgSize.height} />
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
