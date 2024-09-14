import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import {
  CameraDevice,
  CameraDeviceFormat,
} from 'react-native-vision-camera';
import {
  CONTENT_SPACING_Y
} from '@/constants/Screen';
import { StrokeText } from "@charmy.tech/react-native-stroke-text";
import { styleSheet } from '@/libs/styles';

function getBestFormat(
  device: CameraDevice,
  targetWidth: number,
  targetHeight: number,
): CameraDeviceFormat {
  const size = targetWidth * targetHeight;
  return device.formats.reduce((prev, curr) => {
    const currentSize = curr.photoWidth * curr.photoHeight;
    const diff = Math.abs(size - currentSize);

    const previousSize = prev.photoWidth * prev.photoHeight;
    const prevDiff = Math.abs(size - previousSize);
    if (diff < prevDiff) {
      return curr;
    }
    return prev;
  }, device.formats[0]);
}

export default function About(): JSX.Element {
  const styles = styleSheet();

  return (
    <View style={styles.appContainer}>
      <ImageBackground 
        resizeMethod='resize' 
        source={require('@/assets/images/bg.webp')} 
        resizeMode="cover" 
        style={StyleSheet.absoluteFill} 
      />
      <View style={styles.logo}>
        <StrokeText
          text='SumjO'
          fontSize={CONTENT_SPACING_Y * 1.5}
          color='#ffffff'
          strokeColor='#000000'
          strokeWidth={CONTENT_SPACING_Y / 2}
          fontFamily='LemonRegular'
        />
      </View>
    </View>
  );
}
