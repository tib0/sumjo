import React, { useEffect, useMemo } from 'react';
import { CONTENT_SPACING_Y, PIXEL_FORMAT } from '@/constants/Screen';
import { styleSheet } from '@/libs/styles';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';
import { StyleSheet, View } from 'react-native';
import {
  Camera as RNCamera,
  useCameraDevice,
  useCameraPermission
} from 'react-native-vision-camera';
import { PHOTO_SRC_WIDTH, PHOTO_SRC_HEIGHT } from '@/constants/Image';
import { getBestFormat } from '@/libs/camera';

type ICamera = {
  isCameraEnabled?: boolean;
};

const Camera = React.forwardRef<RNCamera, ICamera>((
  { isCameraEnabled }: ICamera, ref: React.Ref<RNCamera>
) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);
  const styles = styleSheet();
  const position = 'back';
  const pixelFormat = PIXEL_FORMAT;
  const device = useCameraDevice(position, {
    physicalDevices: ['wide-angle-camera'],
  });

  const format = useMemo(
    () => (device != null ?
      getBestFormat(device, PHOTO_SRC_WIDTH, PHOTO_SRC_HEIGHT) :
      undefined
    ),
    [device],
  );

  return (
    <>
      {!hasPermission &&
        <StrokeText
          text={'No Camera Permission.'}
          fontSize={CONTENT_SPACING_Y / 2}
          color='#F40000'
          strokeColor='#000000'
          align='center'
          strokeWidth={CONTENT_SPACING_Y / 5}
          fontFamily='LemonRegular'
        />
      }
      {device == null &&
        <StrokeText
          text={'No Camera Found.'}
          fontSize={CONTENT_SPACING_Y / 2}
          color='#F40000'
          strokeColor='#000000'
          align='center'
          strokeWidth={CONTENT_SPACING_Y / 5}
          fontFamily='LemonRegular'
        />}
      {hasPermission && device != null && (
        <View style={styles.cameraBox}>
          <View style={styles.overlayTop}></View>
          <View style={styles.overlayBottom}></View>
          <View style={styles.overlayBorder}></View>
          <RNCamera
            ref={ref}
            style={StyleSheet.absoluteFill}
            device={device}
            photo={true}
            isActive={isCameraEnabled ?? false}
            outputOrientation={'preview'}
            format={format}
            pixelFormat={pixelFormat}
            exposure={1}
            enableZoomGesture={false}
            onError={(err) => { console.log('RNCamera Error : ', err) }}
          />
        </View>
      )}
    </>
  );
});

Camera.displayName = 'Camera';

export default Camera;