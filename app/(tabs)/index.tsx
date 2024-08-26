import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Button } from 'react-native'
import { useTensorflowModel } from 'react-native-fast-tflite'
import {
  //ImagePickerResponse,
  //launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { convertToRGB } from 'react-native-image-to-rgb';
//import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useAssets } from 'expo-asset';
//import { useFrameProcessor } from 'react-native-vision-camera';

export default function HomeScreen() {
  const model = useTensorflowModel(require('../../assets/models/sumjo8su_float32.tflite'), 'core-ml')//model path
  const actualModel = model.state === 'loaded' ? model.model : undefined
/*
  const [image, setImage] = useState<ImagePickerResponse | null>();
  const [result, setResult] = useState<string>('');
*/
  useEffect(() => {
    if (actualModel == null) return
    console.log(`Model loaded!`);
  }, [actualModel]);

  console.log(`Model: ${model.state} (${model.model != null})`);

  //const { resize } = useResizePlugin();

  //const objectDetection = useTensorflowModel(require('object_detection.tflite'))
/* 
  const handleCanvas = (canvas: Canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
  } */

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
  
 /*  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (actualModel == null) return

    // 1. Resize 4k Frame to 192x192x3 using vision-camera-resize-plugin
    const resized = resize(frame, {
      scale: {
        width: 192,
        height: 192,
      },
      pixelFormat: 'rgb',
      dataType: 'uint8',
    })

    // 2. Run model with given input buffer synchronously
    const outputs = actualModel.runSync([resized])

    // 3. Interpret outputs accordingly
    const detection_boxes = outputs[0]
    const detection_classes = outputs[1]
    const detection_scores = outputs[2]
    const num_detections = outputs[3]
    console.log(`Detected ${num_detections[0]} objects!`)

    for (let i = 0; i < detection_boxes.length; i += 4) {
      const confidence = detection_scores[i / 4]
      if (confidence > 0.7) {
        // 4. Draw a red box around the detected object!
        const left = detection_boxes[i]
        const top = detection_boxes[i + 1]
        const right = detection_boxes[i + 2]
        const bottom = detection_boxes[i + 3]
        const rect = SkRect.Make(left, top, right, bottom)
        handleCanvas.drawRect(rect, SkColors.Red)
      }
    }
  }, [model]) */


  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo', maxWidth: 640, maxHeight: 640 },//model input dimensions 640x640
      async response => {
        if (!response.didCancel) {
          if (response.assets && response.assets.length > 0 && response.assets[0]?.uri) {
            console.log(response.assets[0]?.uri)
            
            const resized = await resizeImage(response.assets[0].uri, 640, 640)
            if (!resized) return;

            const convertedArray = await convertToRGB(resized);
            let red = []
            let blue = []
            let green = []
            for (let index = 0; index < convertedArray.length; index += 3) {
              red.push(convertedArray[index] / 255);
              green.push(convertedArray[index + 1] / 255);
              blue.push(convertedArray[index + 2] / 255);
            }
            const finalArray = [...red, ...green, ...blue];
            //convert to Uint8 array buffer (but some models require float32 format) Float32Array///Uint8Array
            const arrayBuffer = new Float32Array(finalArray);
            const result = actualModel?.runSync([arrayBuffer])
             console.log(result?.length)
            // Assuming `result` is the output tensor from the model with shape [1,5,8400]
            if (!result || result.length < 1) return;
            const outputTensor = result[0]; // Access the tensor
            console.log(outputTensor?.length)
            const numDetections = 8400; // Total number of predictions
            const Alldetections: any = [];

            const targetWidth = 640;
            const targetHeight = 640;
        
            for (let i = 0; i < numDetections; i++) {
              const cx = Number(outputTensor[i]);
              const cy = Number(outputTensor[i + 8400 * 1]);
              const w = Number(outputTensor[i + 8400 * 2]);
              const h = Number(outputTensor[i + 8400 * 3]);
              const x4 = outputTensor[i + 8400 * 4];
              const x5 = outputTensor[i + 8400 * 5];
              const x6 = outputTensor[i + 8400 * 6];
              const x7 = outputTensor[i + 8400 * 7];
              const x8 = outputTensor[i + 8400 * 8];
              const x9 = outputTensor[i + 8400 * 9];
              const y10 = outputTensor[i + 8400 * 10];
              const y11 = outputTensor[i + 8400 * 11];
              const y12 = outputTensor[i + 8400 * 12];
              const y13 = outputTensor[i + 8400 * 13];
              const y14 = outputTensor[i + 8400 * 14];
              const y15 = outputTensor[i + 8400 * 15];
              const y16 = outputTensor[i + 8400 * 16];
              const y17 = outputTensor[i + 8400 * 17];
              const y18 = outputTensor[i + 8400 * 16];

              
              const left = (cx - w / 2) * targetWidth;
              const top = (cy - h / 2) * targetHeight;
              const right = (cx + w / 2) * targetWidth;
              const bottom = (cy + h / 2) * targetHeight;
              if (x4 != 0) Alldetections.push({
                coordinate: {
                  cx,
                  cy,
                  w,
                  h,
                },
                boundingbox: {  
                  left,
                  top,
                  right,
                  bottom
                },
                x4,
                x5,
                x6,
                x7,
                x8,
                x9,
                y10,
                y11,
                y12,
                y13,
                y14,
                y15,
                y16,
                y17,
                y18
                /* boundingBox: { x, y, width, height },
                score: confidenceForclass1 */
              }); 
            }
            console.log(Alldetections)
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

      <ThemedView /* style={styles.buttonContainer} */>
        <Button /* style={styles.buttonStyle} */ title="Launch gallery" onPress={uploadImage} />
      </ThemedView>
      {/* <View style={{
        width: 350,
        height: 700
      }}>
        <Canvas ref={handleCanvas} style={{
          width: 350,
          height: 700,
          borderWidth: 1,
          borderColor: "red",
          backgroundColor: "blue",
        }} />
      </View> */}
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
