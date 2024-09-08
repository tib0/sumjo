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
  Pressable,
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
  const position = 'back';
  const camera = useRef<RNCamera>(null)
  const [isVisible, setIsVisible] = useState(true);
  const [isVisible2, setIsVisible2] = useState(false);
  const pixelFormat = Platform.OS == 'ios' ? 'rgb' : 'yuv';
  const device = useCameraDevice(position);
  const model = useContext(SumjoModelContext);
  const [s, setS] = useState(0);

  const cameraSize = scale(SCREEN_WIDTH - 40, (SCREEN_HEIGHT / 1.5) - 40, device?.formats[0].photoWidth, device?.formats[0].photoHeight);
  const format = useMemo(
    () => (device != null ? getBestFormat(device, cameraSize.width, cameraSize.height) : undefined),
    [device],
  );
  useFocusEffect(
    useCallback(() => {
      setIsVisible(true);
      return () => {
        setIsVisible(false);
      }
    }, [])
  )
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
    if (!camera || !camera.current) return;
    const photo = await camera.current.takePhoto({enableShutterSound: false});
    const boxes2 = await performDetectionFromUri(model?.model as TensorflowModel, photo.path); 
    const s2 = sum(boxes2);
    setS(s2);
    setIsVisible(false);
    setIsVisible2(true);
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
            style={styles(cameraSize).camera}
            device={device}
            photo={true}
            isActive={isVisible}
            format={format}
            pixelFormat={pixelFormat}
            enableFpsGraph={false}
            enableZoomGesture={false}
            onError={(err)=> { console.log('err **',err)}}
          />
        </View>
      )}
      
      <View style={styles(cameraSize).bottomButtonRow}>
        <PressableOpacity style={styles(cameraSize).button} onPress={() => takePhoto()}>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 46/2 }}>{'Get my score !'}</Text>
        </PressableOpacity>
        <View style={styles(cameraSize).bottomButtonRowSplit}>
          <PressableOpacity style={styles(cameraSize).buttonSplit} onPress={() => takePhoto()}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 46/2 }}>{'About'}</Text>
          </PressableOpacity>
          <PressableOpacity style={styles(cameraSize).buttonSplit} onPress={() => takePhoto()}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 46/2 }}>{'History'}</Text>
          </PressableOpacity>
        </View>
      </View>

      <Modal animationType="slide" transparent={true} visible={isVisible2}>
        <TouchableOpacity style={styles(cameraSize).modalContainer} onPress={() => {
          setIsVisible2(false);
          setIsVisible(true);
        }}>
          <TouchableOpacity style={styles(cameraSize).modal} activeOpacity={.7} >
            <View style={styles(cameraSize).modalContent}>
              <View style={styles(cameraSize).titleContainer}>
                <Text style={styles(cameraSize).title}>Your score:</Text>
                <Pressable onPress={() => {
                  setIsVisible2(false);
                  setIsVisible(true);
                }}>
                  <Text style={styles(cameraSize).title}>X</Text>
                </Pressable>
              </View>
              <Text style={styles(cameraSize).result}>{s.toString()}</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 46 / 3,
    backgroundColor: 'black',
  },
  camera: {
    width: cameraSize?.width - 46 / 1.5 || '95%',
    height: cameraSize?.height - 46 / 1.5 || '55%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent:'space-between',
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
    justifyContent:'space-between',
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
    height: 150,
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
    fontSize: 16,
  },
  modal: {
    width: '100%',
    height: 150
  },
  result: {
    color: '#fff',
    fontSize: 36,
  },
});
