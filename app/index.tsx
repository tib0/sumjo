import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef
} from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';
import {
  Camera as RNCamera,
  useCameraPermission,
} from 'react-native-vision-camera';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { useFocusEffect } from 'expo-router';
import { performDetectionFromUri } from '@/libs/model';
import { type TensorflowModel } from 'react-native-fast-tflite';
import { sum } from '@/libs/sumjo';
import { styleSheet } from '@/libs/styles';
import Camera from '@/components/camera';
import { Button } from '@/components/button';
import { ResultModal } from '@/components/resultModal';
import { Logo } from '@/components/logo';

export default function Index(): JSX.Element {
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<RNCamera>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const model = useContext(SumjoModelContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [score, setScore] = useState(0);
  const styles = styleSheet();

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
      requestPermission();
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
    const oBoxes = await performDetectionFromUri(
      model?.model as TensorflowModel,
      photo.path
    );
    setScore(sum(oBoxes));
    setIsCameraEnabled(false);
    setIsModalVisible(true);
  }

  return (
    <View style={styles.appContainer}>
      <ImageBackground
        resizeMethod='resize'
        source={require('@/assets/images/bg.webp')}
        resizeMode='cover'
        style={StyleSheet.absoluteFill}
      />

      <Logo />

      <Camera isCameraEnabled={isCameraEnabled} ref={camera} />

      <View style={styles.bottomButtonRow}>
        <Button onPress={() => takePhoto()} text={'Get my score!'} />
      </View>

      <ResultModal
        isModalVisible={isModalVisible}
        onPress={() => {
          setIsModalVisible(false);
          setIsCameraEnabled(true);
        }}
        score={score.toString()}
      />
    </View>
  );
}
