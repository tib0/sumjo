import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { SumjoModelContext } from '@/context/SumjoModelContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const model = useTensorflowModel(require('@/assets/models/sumjo8su_float32.tflite'));
  const [fontLoaded] = useFonts({
    LemonRegular: require('@/assets/fonts/LemonRegular.ttf')
  });

  useEffect(() => {
    if (!fontLoaded) return;
    if (!model) return;
    if (model.state !== 'loaded') return;
    SplashScreen.hideAsync();
  }, [fontLoaded, model]);

  if (!fontLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <SumjoModelContext.Provider value={model}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SumjoModelContext.Provider>
    </ThemeProvider>
  );
}
