import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
  useRef
} from 'react';
import {
  ImageBackground,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera as RNCamera,
  useCameraDevice,
  useCameraPermission,
  CameraDevice,
  CameraDeviceFormat,
} from 'react-native-vision-camera';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { useFocusEffect } from 'expo-router';
import { performDetectionFromUri } from '@/libs/model';
import { type TensorflowModel } from 'react-native-fast-tflite';
import { sum } from '@/libs/sumjo';
import { PressableOpacity } from 'react-native-pressable-opacity'
import { CONTENT_SPACING_X, CONTENT_SPACING_Y, BOTTOM_SPEC, SCREEN_HEIGHT, SCREEN_WIDTH } from '@/constants/Screen';
import { DetectionBox } from '@/types/Sumjo';
import { PHOTO_SRC_HEIGHT, PHOTO_SRC_WIDTH } from '@/constants/Image';
import { StrokeText } from "@charmy.tech/react-native-stroke-text";

const styleSheet = (cameraSize: { width: number, height: number }, padding: {x: number, y: number, bottomSpec: number}) => StyleSheet.create({
  appContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingHorizontal: padding.x,
    paddingTop: padding.y / 1.25,
    minHeight: '100%',
    paddingBottom: padding.y / 4 + padding.bottomSpec,
    backgroundColor: 'lightgreen'
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: '0%',
    height: '20%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'black',
    opacity: .6
  },
  overlayBottom: {
    position: 'absolute',
    top: '80%',
    height: '20%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'black',
    opacity: .6
  },
  logo: {
    alignItems: 'center',
    paddingBottom: padding.y / 3,
  },
  cameraBox: {
    flex: 4,
    width: cameraSize.width,
    height: cameraSize.height,
    borderRadius: padding.y / 3,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  bottomButtonRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: padding.y / 4,
  },
  button: {
    width: '100%',
    height: padding.y * 1.75,
    borderRadius: padding.y / 3,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontSize: 46 / 1.75,
    fontFamily: 'LemonRegular'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
  modalContent: {
    height: 350,
    width: '100%',
    backgroundColor: '#25292e',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: 32,
    backgroundColor: '#464C55',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 18,
  },
  modal: {
    width: '100%',
    height: 350
  },
  result: {
    color: '#fff',
    fontSize: 36,
  },
  resultDetail: {
    color: '#fff',
    fontSize: 18,
  },
});

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

export default function Index(): JSX.Element {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const position = 'back';
  const camera = useRef<RNCamera>(null)
  const device = useCameraDevice(position,  {
    physicalDevices: ['wide-angle-camera'], 
 });
  const model = useContext(SumjoModelContext);
  const [score, setScore] = useState(0);
  const [boxes, setBoxes] = useState<DetectionBox[]>([]);
  const pixelFormat = Platform.OS == 'ios' ? 'rgb' : 'yuv';
  const format = useMemo(
    () => (device != null ? getBestFormat(device, PHOTO_SRC_WIDTH, PHOTO_SRC_HEIGHT) : undefined),
    [device],
  );
  const cameraSize = {
    width: SCREEN_WIDTH - 40, 
    height: (SCREEN_HEIGHT / 1.5) - 40
  };
  const styles = styleSheet(cameraSize, {x: CONTENT_SPACING_X, y: CONTENT_SPACING_Y, bottomSpec: BOTTOM_SPEC});
  useFocusEffect(
    useCallback(() => {
      setIsCameraEnabled(true);
      return () => {
        setIsCameraEnabled(false);
      }
    }, [])
  );
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

  async function takePhoto() {
    if (!camera || !camera.current || !isCameraEnabled) return;
    
    const photo = await camera.current.takePhoto({ enableShutterSound: false });
    const oBoxes = await performDetectionFromUri(model?.model as TensorflowModel, photo.path);
    const s2 = sum(oBoxes);

    setBoxes(oBoxes);
    setScore(s2);
    setIsCameraEnabled(false);
    setIsModalVisible(true);
  }

  return (
      <View style={styles.appContainer}>

        <ImageBackground resizeMethod='resize' source={require('@/assets/images/bg.webp')} resizeMode="cover" style={StyleSheet.absoluteFill}>
        </ImageBackground>
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
          {!hasPermission && <Text style={styles.text} onPress={requestPermission}>No Camera Permission.</Text>}
          {device == null && <Text style={styles.text}>No Camera Found.</Text>}
          
          {hasPermission && device != null && (
            <View style={styles.cameraBox}>
              <View style={styles.overlayTop}></View>
              <View style={styles.overlayBottom}></View>
              <RNCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                photo={true}
                isActive={isCameraEnabled}
                outputOrientation={'preview'}
                format={format}
                pixelFormat={pixelFormat}
                enableZoomGesture={false}
                onError={(err) => { console.log('RNCamera Error : ', err) }}
              />
            </View>
          )}

          <View style={styles.bottomButtonRow}>
            <PressableOpacity style={styles.button} onPress={() => takePhoto()}>
              <Text style={styles.buttonText}>{'Get my score!'}</Text>
            </PressableOpacity>
          </View>

          <Modal animationType='slide' transparent={true} visible={isModalVisible}>
            <TouchableOpacity style={styles.modalContainer} onPress={() => {
              setIsModalVisible(false);
              setIsCameraEnabled(true);
            }} activeOpacity={.8}>
              <TouchableOpacity style={styles.modal}>
                <View style={styles.modalContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>Your score:</Text>
                  </View>
                  <Text style={styles.result}>{score.toString()}</Text>
                  
                  {boxes.map((box, index) =>
                    <Text 
                      key={'detection-' + index.toString()} 
                      style={styles.resultDetail}
                    >
                      {box.label}: {Math.round(box.prob * 100)}%
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
      </View>
  );
}
