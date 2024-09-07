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
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera as RNCamera,
  useCameraDevice,
  useCameraPermission,
  CameraDevice, 
  CameraDeviceFormat, 
  useFrameProcessor,
  runAtTargetFps,
} from 'react-native-vision-camera';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useFocusEffect } from 'expo-router';
import { performDetectionFromArray } from '@/libs/model';
import { DetectionBox } from '@/types/Sumjo';
import { useSharedValue, Worklets } from 'react-native-worklets-core';
import { type TensorflowModel } from 'react-native-fast-tflite';
import { sum } from '@/libs/sumjo';
import { PressableOpacity } from 'react-native-pressable-opacity'

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
  const camera = useRef<RNCamera>(null)
  const [isVisible, setIsVisible] = useState(true);
  const [isVisible2, setIsVisible2] = useState(true);
  const pixelFormat = Platform.OS == 'ios' ? 'rgb' : 'yuv';
  const device = useCameraDevice(position);
  const { resize } = useResizePlugin();
  const model = useContext(SumjoModelContext);
  const boxes = useSharedValue<DetectionBox[]>([]);
  const [s, setS] = useState(0);
  const updateBoxesValue = Worklets.createRunOnJS((v: DetectionBox[]) => {
    boxes.value = v;
  })
  const score = useSharedValue<number>(0);
  const updateScoreValue = Worklets.createRunOnJS((v: number) => {
    setS(v);
    score.value = v;
  })
  const format = useMemo(
    () => (device != null ? getBestFormat(device, 640, 640) : undefined),
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
    console.log('take photo')
    if (!camera || !camera.current) return;
    const photo = await camera.current.takePhoto({enableShutterSound: false});
    console.log(photo.path);
  }

  const frameProcessorAlt = useFrameProcessor((frame) => {
    'worklet'
    runAtTargetFps(2, () => {
      'worklet'
      const resized = resize(frame, {
        scale: {
          width: 640,
          height: 640
        },
        pixelFormat: 'rgb',
        dataType: 'float32'
      });
      updateBoxesValue(performDetectionFromArray(model?.model as TensorflowModel, resized)); 
    });
    if (!boxes || !boxes.value || boxes.value.length < 1) return;
    const sumo = sum(boxes.value);
    updateScoreValue(sumo);
  }, [model]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />
      {!hasPermission && <Text style={styles.text}>No Camera Permission.</Text>}
      {device == null && <Text style={styles.text}>No Camera Found.</Text>}
      {hasPermission && device != null && (
        <RNCamera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          photo={true}
          isActive={isVisible}
          frameProcessor={frameProcessorAlt}
          format={format}
          pixelFormat={pixelFormat}
          enableFpsGraph={true}
          enableZoomGesture={false}
          onError={(err)=> { console.log('err **',err)}}
        />
      )}
      <View style={styles.rightButtonRow}>
        <PressableOpacity style={styles.button} onPress={() => takePhoto()}>
          <Text style={{ color: 'white', fontWeight: '900' }}>{s}</Text>
        </PressableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={isVisible2}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Choose a sticker</Text>
            <Pressable onPress={() => setIsVisible2(false)}>
              X
            </Pressable>
          </View>
          {'children'}
        </View>
      </Modal>
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
  rightButtonRow: {
    position: 'absolute',
    right: 18,
    bottom: 200,
  },
  button: {
    marginTop: 8,
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    height: '25%',
    width: '100%',
    backgroundColor: '#25292e',
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: '16%',
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
});
