import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
  useRef
} from 'react';
import {
  Modal,
  Platform,
  ScrollView,
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
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/constants/Screen';
import { scale } from '@/libs/pixel';
import { DetectionBox } from '@/types/Sumjo';
import * as MediaLibrary from 'expo-media-library';

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
  const [mediaPermissionResponse, mediaRequestPermission] = MediaLibrary.usePermissions();
  const position = 'back';
  const camera = useRef<RNCamera>(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [boxes, setBoxes] = useState<DetectionBox[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pixelFormat = Platform.OS == 'ios' ? 'rgb' : 'yuv';
  const device = useCameraDevice(position);
  const model = useContext(SumjoModelContext);
  const [score, setScore] = useState(0);
  const cameraSize = scale(
    SCREEN_WIDTH - 40, 
    (SCREEN_HEIGHT / 1.5) - 40, 
    device?.formats[0].photoWidth, 
    device?.formats[0].photoHeight
  );
  const format = useMemo(
    () => (device != null ? getBestFormat(device, cameraSize.width, cameraSize.height) : undefined),
    [device],
  );
  useFocusEffect(
    useCallback(() => {
      setIsCameraEnabled(true);
      return () => {
        setIsCameraEnabled(false);
      }
    }, [])
  )
  useEffect(() => {
    if (!hasPermission) {
      RNCamera.requestCameraPermission();
    }
    if (!mediaPermissionResponse?.granted) {
      mediaRequestPermission();
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
    console.log(photo.path);
    await MediaLibrary.saveToLibraryAsync(photo.path);
    const oBoxes = await performDetectionFromUri(model?.model as TensorflowModel, photo.path);
    console.log(oBoxes.length);
    const s2 = sum(oBoxes);
    console.log(s2);

    setBoxes(oBoxes);
    setScore(s2);
    setIsCameraEnabled(false);
    setIsModalVisible(true);
  }

  return (
    <ScrollView style={styles(cameraSize).scrollContainer}>
      <View style={styles(cameraSize).appContainer}>

        <Text style={styles(cameraSize).logo}>Sumjo</Text>
        {!hasPermission && <Text style={styles(cameraSize).text} onPress={requestPermission}>No Camera Permission.</Text>}
        {device == null && <Text style={styles(cameraSize).text}>No Camera Found.</Text>}

        {hasPermission && device != null && (
          <View style={styles(cameraSize).cameraBox}>
            <RNCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              photo={true}
              isActive={isCameraEnabled}
              format={format}
              pixelFormat={pixelFormat}
              enableZoomGesture={false}
              onError={(err) => { console.log('RNCamera Error : ', err) }}
            />
          </View>
        )}

        <View style={styles(cameraSize).bottomButtonRow}>
          <PressableOpacity style={styles(cameraSize).button} onPress={() => takePhoto()}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 46 / 2 }}>{'Get my score !'}</Text>
          </PressableOpacity>
          <View style={styles(cameraSize).bottomButtonRowSplit}>
            <PressableOpacity style={styles(cameraSize).buttonSplit} onPress={() => takePhoto()}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 46 / 2 }}>{'About'}</Text>
            </PressableOpacity>
            <PressableOpacity style={styles(cameraSize).buttonSplit} onPress={() => takePhoto()}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 46 / 2 }}>{'History'}</Text>
            </PressableOpacity>
          </View>
        </View>

        <Modal animationType="slide" transparent={true} visible={isModalVisible}>
          <TouchableOpacity style={styles(cameraSize).modalContainer} onPress={() => {
            setIsModalVisible(false);
            setIsCameraEnabled(true);
          }} activeOpacity={.8}>
            <TouchableOpacity style={styles(cameraSize).modal}>
              <View style={styles(cameraSize).modalContent}>
                <View style={styles(cameraSize).titleContainer}>
                  <Text style={styles(cameraSize).title}>Your score:</Text>
                </View>
                <Text style={styles(cameraSize).result}>{score.toString()}</Text>
                {boxes.map((box, index) =>
                  <Text 
                    key={'detection-' + index} 
                    style={styles(cameraSize).resultDetail}
                  >
                    {box.label}: {Math.round(box.prob * 100)}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

      </View>
    </ScrollView>
  );
}

const styles = (cameraSize: { width: number, height: number }) => StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 40 / 2,
    paddingTop: 46,
    minHeight: '100%',
    paddingVertical: 40 / 2,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: 'lightgreen',
  },
  logo: {
    color: 'black',
    fontSize: 46 * 1.5,
    lineHeight: 46 * 1.5,
    fontWeight: '900',
    textAlign: 'center',
    paddingBottom: 46 / 2,
  },
  cameraBox: {
    width: cameraSize?.width || '95%',
    height: cameraSize?.height || '95%',
    borderRadius: 46 / 3,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  bottomButtonRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: 46 / 2,
    width: '100%',
    height: 46 * 1.5,
    borderRadius: 46 / 3,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonRowSplit: {
    marginTop: 46 / 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 46 / 3
  },
  buttonSplit: {
    height: 46 * 1,
    borderRadius: 46 / 4,
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,.75)',
    justifyContent: 'center',
    alignItems: 'center',
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
