import React, { useEffect, useState, useMemo, useContext, useCallback } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera as RNCamera,
  useCameraDevice,
  useCameraPermission,
  useSkiaFrameProcessor,
  CameraDevice, CameraDeviceFormat, 
  useFrameProcessor,
  runAtTargetFps
} from 'react-native-vision-camera';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useFocusEffect } from 'expo-router';
import { performDetectionFromArray } from '@/libs/model';
import { Skia } from '@shopify/react-native-skia';

function getBestFormat(
  device: CameraDevice,
  targetWidth: number,
  targetHeight: number,
): CameraDeviceFormat {
  const size = targetWidth * targetHeight;
  return device.formats.reduce((prev, curr) => {
    const currentSize = curr.videoWidth * curr.videoHeight;
    const diff = Math.abs(size - currentSize);

    const previousSize = prev.videoWidth * prev.videoHeight;
    const prevDiff = Math.abs(size - previousSize);
    if (diff < prevDiff) {
      return curr;
    }
    return prev;
  }, device.formats[0]);
}

export default function Camera(): JSX.Element {
  const { hasPermission } = useCameraPermission();
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [isVisible, setIsVisible] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setIsVisible(true);
      return () => {
        setIsVisible(false);
      }
    }, [])
  )
  const device = useCameraDevice(position);
  const { resize } = useResizePlugin();
  const model = useContext(SumjoModelContext);

  const format = useMemo(
    () => (device != null ? getBestFormat(device, 640, 640) : undefined),
    [device],
  );

  const pixelFormat = Platform.OS == 'ios' ? 'rgb' : 'yuv';

  useEffect(() => {
    if (!hasPermission) {
      RNCamera.requestCameraPermission();
    }
  }, []);

  useEffect(() => {
    if (model?.model == null) {
      return;
    }
  }, [model]);
  
  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet'
    if (!model?.model) return;
    frame.render();

    runAtTargetFps(12, () => {
      'worklet'
      const resized = resize(frame, {
        scale: {
          width: 640,
          height: 640
        },
        pixelFormat: 'rgb',
        dataType: 'float32'
      });
      const output = performDetectionFromArray(model?.model, resized);

      if (!output) return;
      output.map(box => {
        const rect = Skia.XYWHRect(((box.xSize.x - box.xSize.w / 2) * frame.width), ((box.xSize.y - box.xSize.h / 2) * frame.height), (box.xSize.w * frame.width), (box.xSize.h * frame.height));
        const paint = Skia.Paint();
        paint.setColor(Skia.Color('red'));
        paint.setAlphaf(.2)
        frame.drawRect(rect, paint);
      })
    });
  }, [model]);

  const flipCamera = () => setPosition(p => (p === 'back' ? 'front' : 'back'));

  return (
    <View style={styles.container} onTouchEnd={flipCamera}>
      <StatusBar barStyle="light-content" />
      {!hasPermission && <Text style={styles.text}>No Camera Permission.</Text>}
      {hasPermission && device != null && (
        <RNCamera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isVisible}
          fps={24}
          frameProcessor={frameProcessor}
          format={format}
          pixelFormat={pixelFormat}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
});
