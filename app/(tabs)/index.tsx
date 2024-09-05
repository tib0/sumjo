import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Image as RNImage, Button, useWindowDimensions } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { Canvas, Rect, Text, Skia, SkImage, Image as SKImage, Group } from '@shopify/react-native-skia';
import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { scale } from '@/libs/pixel';
import { getColor, sum } from '@/libs/sumjo';
import { Font } from '@/constants/Font';
import { performDetectionFromUri } from '@/libs/model';
import { DetectionBox } from '@/types/Sumjo';

export default function HomeScreen() {
  const model = useContext(SumjoModelContext);
  const currentModel = (model && model.state === 'loaded') ? model.model : undefined;
  useEffect(() => {
    if (currentModel == null) return;
  }, [currentModel]);

  const [img, setImg] = 
    useState<SkImage | null>();
  const [imgSize, setImgSize] = 
    useState({ width: 0, height: 0 });
  const [boxes, setBoxes] = 
    useState<DetectionBox[]>([]);
  const { height: wHeight, width: wWidth } = 
    useWindowDimensions();

  useEffect(() => {
    if (!img) return;
    setImgSize(scale(wWidth - 48, (wHeight / 2) - 48, img?.width(), img?.height()));
  }, [img, wWidth, wHeight]);

  const uploadImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1, includeBase64: true },
      async response => {
        if (!response.didCancel && currentModel) {
          if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
            const uri = response.assets[0]?.uri;
            const data = await Skia.Data.fromURI(uri);
            if (!data) return;
            const image = Skia.Image.MakeImageFromEncoded(data);
            if (!image) return;
            setImg(image);
            const output = await performDetectionFromUri(currentModel, uri);
            if (!output || !Array.isArray(output)) return;
            setBoxes(output);
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
        <Button title='Launch gallery tt' onPress={uploadImage} />
        {img && boxes &&
          <Canvas style={{ width: imgSize.width, height: imgSize.height, borderColor: 'pink', borderWidth: 1 }}>
            <SKImage image={img} fit='contain' x={0} y={0} width={imgSize.width} height={imgSize.height} />
            {boxes.map((box: any, index: number) =>
              <Group key={`detection-box-${index}-${box.label}`}>
                <Text 
                  color={'black'} 
                  text={box.label} x={(box.xSize.x + (box.xSize.w / 3)) * imgSize.width - 7} 
                  y={((box.xSize.y + (box.xSize.h / 2)) * imgSize.height - 4)} 
                  font={Font} 
                />
                <Rect 
                  x={(box.xSize.x - box.xSize.w / 2) * imgSize.width} y={(box.xSize.y - box.xSize.h / 2) * imgSize.height} 
                  width={box.xSize.w * imgSize.width} height={box.xSize.h * imgSize.height} 
                  strokeCap='square' strokeWidth={2} strokeMiter={3} strokeJoin={'round'} 
                  style='stroke' color={getColor(box.label)} opacity={box.prob} 
                />
              </Group>
            )}
          </Canvas>
        }
        {boxes && <Collapsible title={`Total : ${sum(boxes)}`}>
          {boxes.map((res: DetectionBox, index: number) => 
            <ThemedText key={`result-${index}`}>
              <ThemedText>Class ID: {res.label} Prob: {Math.round(res.prob * 100)}</ThemedText>
            </ThemedText>
          )}
        </Collapsible>}
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
