import { useEffect, useState } from 'react';
import { StyleSheet, Image as RNImage, Button, useWindowDimensions, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  launchImageLibrary,
} from 'react-native-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
import { Canvas, Rect, Text, Skia, SkImage, Image as SKImage, matchFont } from '@shopify/react-native-skia';
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
  if (!srcWidth || ! srcHeight) return { height: 0, width: 0 };
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

export default function HomeScreen() {
  const model = useTensorflowModel(require('@/assets/models/sumjo8su_float32.tflite'));
  const actualModel = model.state === 'loaded' ? model.model : undefined;
  useEffect(() => {
    if (actualModel == null) return
    console.log(`Model loaded!`);
  }, [actualModel]);
  
  const [img, setImg] = useState<SkImage | null>();
  const [img2, setImg2] = useState<SkImage | null>();
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [img2Size, setImg2Size] = useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = useState<any>([]);
  const { height: wHeight, width: wWidth } = useWindowDimensions();
  const detectionTreshold = .001;

  console.log(`Model: ${model.state} (${model.model != null})`);

  useEffect(() => {
    if (!img) return;
    if (!img2) return;
    setImgSize(scale(wWidth - 48, (wHeight /2) - 48, img?.width(), img?.height()));
    setImg2Size(scale(wWidth - 48, (wHeight /2) - 48, img2?.width(), img2?.height()));
  }, [img, img2]);

  console.log(`Image size on screen: ${imgSize.width} ${imgSize.height}`);
  console.log(`Image squared size on screen: ${img2Size.width} ${img2Size.height}`);

  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo', maxHeight: 640, maxWidth: 640 },
      async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
            console.log(response.assets[0]?.uri);
            const data = await Skia.Data.fromURI(response.assets[0]?.uri);
            const image = Skia.Image.MakeImageFromEncoded(data);
            setImg(image);
            console.log(image?.getImageInfo());
            const resized = await resizeImage(response.assets[0].uri, 640, 640)
            console.log(resized);
            if (!resized) return;
            const data2 = await Skia.Data.fromURI(resized);
            const image2 = Skia.Image.MakeImageFromEncoded(data2);
            setImg2(image2);
            console.log(image2?.getImageInfo());
            const convertedArray = await convertToRGB(resized);
            console.log(convertedArray.length);
            let red = [];
            let blue = [];
            let green = [];
            for (let index = 0; index < convertedArray.length; index += 3) {
              red.push(convertedArray[index] / 255);
              green.push(convertedArray[index + 1] / 255);
              blue.push(convertedArray[index + 2] / 255);
            }
            const finalArray = [ ...red, ...green, ...blue];
            const arrayBuffer = new Float32Array(finalArray);
            const result = actualModel?.runSync([arrayBuffer]);
            if (!result || result.length < 1) return;
            const outputTensor = result[0];
            const numDetections = 8400;
            let boxes: any = [];
            const yolo_classes = ['0', '1', '10', '11', '12', '2', '3', '4', '5', '6', '7', '8', '9', 'n1', 'n2'];
            const wh = scale(wWidth - 48, (wHeight /2) - 48, image?.width(), image?.height());
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
              const xc = outputTensor[index] as Float;
              const yc = outputTensor[numDetections + index] as Float;
              const w = outputTensor[2 * numDetections + index] as Float;
              const h = outputTensor[3 * numDetections + index] as Float;

              const x1 = (xc - (w / 2));
              const y1 = (yc - (h / 2));
              const x2 = (xc + (w / 2));
              const y2 = (yc + (h / 2));

              boxes.push({
                label,
                prob,
                xsize: {
                  xc: xc, yc: yc, w: w, h: h
                },
                ycoordinate: {
                  x1, y1, x2, y2
                },
              });
            }

            boxes = boxes.sort((boxA: any, boxB: any) => boxB.prob - boxA.prob);
            //console.log(boxes);
            
            const output = [];
            while (boxes.length > 0) {
              output.push(boxes[0]);
              boxes = boxes.filter((box: any) => boxes[0].label !== box.label);
            }
            setBoxes(output);
            console.log(output.length)
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
      <ThemedView style={{flex: 1, alignItems: 'center'}}>
        <Button title='Launch gallery' onPress={uploadImage} />
        {img && boxes &&
          <Canvas style={{ width: imgSize.width, height: imgSize.height, borderColor: 'red', borderWidth: 1 }}>
            <SKImage image={img} fit='contain' x={0} y={0} width={imgSize.width} height={imgSize.height} />
            {/* {boxes.map((box: any) => 
              <Rect x={(box.ycoordinate.x2 * imgSize.width)} y={(box.ycoordinate.y2 * imgSize.height)} width={5} height={5} color="red" opacity={box.prob}/>
            )} */}
          </Canvas>
        }
        {img2 && boxes &&
          <Canvas style={{ width: img2Size.width, height: img2Size.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={img2} fit='contain' x={0} y={0} width={img2Size.width} height={img2Size.height} />
            {boxes.map((box: any) => 
              <>
                <Text color={getColor(box.label)} text={box.label} x={(box.xsize.xc * 640)} y={((box.xsize.yc * 640) - 4)} font={font} />
                <Rect x={(box.xsize.xc * 640)} y={(box.xsize.yc * 640)} width={box.xsize.w * 640} height={box.xsize.h * 640} strokeCap='square' strokeWidth={2} strokeMiter={3} strokeJoin={'round'} style='stroke' color={getColor(box.label)} opacity={box.prob} />
              </>
            )}
            {/* {boxes.map((box: any) => 
              <Rect x={(box.ycoordinate.x1 * img2Size.width)} y={(box.ycoordinate.y1 * img2Size.height)} width={5} height={5} color="blue" opacity={box.prob}/>
            )}
            {boxes.map((box: any) => 
              <Rect x={(box.ycoordinate.x2 * img2Size.width)} y={(box.ycoordinate.y2 * img2Size.height)} width={5} height={5} color="red" opacity={box.prob}/>
            )} */}
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
