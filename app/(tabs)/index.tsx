import { useEffect, useState } from 'react';
import { StyleSheet, Image, Button } from 'react-native'
import { useTensorflowModel } from 'react-native-fast-tflite'
import {
  launchImageLibrary,
} from 'react-native-image-picker';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';

const resizeImage = async (uri: string, width: number, height: number) => {
  try {
    const response = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0, undefined, true, { mode: "stretch" });
    console.log(response.height + "x" + response.width, " img");
    return response.uri;
  } catch (err) {
    console.error(err);
    return null;
  }
};

function iou(box1: any, box2: any) {
  return intersection(box1, box2) / union(box1, box2);
}

function union(box1: any, box2: any) {
  const { box1_x1, box1_y1, box1_x2, box1_y2 } = box1;
  const { box2_x1, box2_y1, box2_x2, box2_y2 } = box2;
  const box1_area = (box1_x2 - box1_x1) * (box1_y2 - box1_y1);
  const box2_area = (box2_x2 - box2_x1) * (box2_y2 - box2_y1);
  return box1_area + box2_area - intersection(box1, box2);
}

function intersection(box1: any, box2: any) {
  const { box1_x1, box1_y1, box1_x2, box1_y2 } = box1;
  const { box2_x1, box2_y1, box2_x2, box2_y2 } = box2;
  const x1 = Math.max(box1_x1, box2_x1);
  const y1 = Math.max(box1_y1, box2_y1);
  const x2 = Math.min(box1_x2, box2_x2);
  const y2 = Math.min(box1_y2, box2_y2);
  return (x2 - x1) * (y2 - y1);
}

export default function HomeScreen() {
  const model = useTensorflowModel(require('../../assets/models/sumjo8su_float32.tflite'), 'core-ml');
  const actualModel = model.state === 'loaded' ? model.model : undefined;
  const [imgSize, setImgSize] = useState({width: 0, height: 0});

  useEffect(() => {
    if (actualModel == null) return
    console.log(`Model loaded!`);
  }, [actualModel]);

  console.log(`Model: ${model.state} (${model.model != null})`);

  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo', maxWidth: 640, maxHeight: 640 },//model input dimensions 640x640
      async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0 && response.assets[0]?.uri) {
            console.log(response.assets[0]?.uri)
            Image.getSize(
              response.assets[0]?.uri, 
              (width, height) => {
                console.log(`Image size: ${width} - ${height}`);
                setImgSize({width, height})
              }, (error) => {
                console.error(`Couldn't get the image size: ${error.message}`);
              });
            const resized = await resizeImage(response.assets[0].uri, 640, 640)
            if (!resized) return;
            const convertedArray = await convertToRGB(resized);
            let red = [];
            let blue = [];
            let green = [];
            for (let index = 0; index < convertedArray.length; index += 3) {
              red.push(convertedArray[index] / 255);
              green.push(convertedArray[index + 1] / 255);
              blue.push(convertedArray[index + 2] / 255);
            }
            const finalArray = [...red, ...green, ...blue];
            const arrayBuffer = new Float32Array(finalArray);
            const result = actualModel?.runSync([arrayBuffer]);
            if (!result || result.length < 1) return;
            console.log(result?.length);
            const outputTensor = result[0];
            console.log(outputTensor?.length);
            const numDetections = 8400;
            const targetWidth = 640;
            const targetHeight = 640;
            let boxes: any = [];
            const yolo_classes = ['0', '1', '10', '11', '12', '2', '3', '4', '5', '6', '7', '8', '9', 'n1', 'n2'];
            for (let index = 0; index < numDetections; index++) {
              const [class_id, prob] = 
                [...Array(15).keys()].map((col) => {
                  return [col, outputTensor[numDetections * (col + 4) + index]]
                }).reduce((accum, item) => 
                  item[1] > accum[1] ? item : accum
                );
              
              if (prob < 0.5) {
                continue;
              }
              const label = yolo_classes[class_id as number];
              const xc = outputTensor[index] as number;
              const yc = outputTensor[numDetections + index] as number;
              const w = outputTensor[2 * numDetections + index] as number;
              const h = outputTensor[3 * numDetections + index] as number;
              const x1 = (xc - w / 2) / targetWidth * imgSize.width;
              const y1 = (yc - h / 2) / targetHeight * imgSize.height;
              const x2 = (xc + w / 2) / targetWidth * imgSize.width;
              const y2 = (yc + h / 2) / targetHeight * imgSize.height;
              const left = (xc - w / 2) * targetWidth;
              const top = (yc - h / 2) * targetHeight;
              const right = (xc + w / 2) * targetWidth;
              const bottom = (yc + h / 2) * targetHeight;
              boxes.push({
                label, 
                prob,
                ycoordinate: {
                  x1, y1, x2, y2 
                },
                zposition: {
                  left, top, right, bottom
                },
              });
            }
            boxes = boxes.sort((boxA: any, boxB: any) => boxB[1] - boxA[1]);
            console.log(boxes);
            const output = [];
            while (boxes.length > 0) {
              output.push(boxes[0]);
              boxes = boxes.filter((box: any) => iou(boxes[0].ycoordinate, box.ycoordinate) < 0.7);
            }
            console.log(output);
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
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView>
        <Button title="Launch gallery" onPress={uploadImage} />
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
