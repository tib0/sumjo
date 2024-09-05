import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { SumjoModelContext } from '@/context/SumjoModelContext';
import { modelToString } from '@/libs/model';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const model = useTensorflowModel(require('@/assets/models/sumjo8su_float32.tflite'));
  const colorScheme = useColorScheme();
  const [fontLoaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (!fontLoaded) return;
    if (!model) return;
    if (model.state !== 'loaded') return;
    console.info(modelToString(model.model));
    SplashScreen.hideAsync();
  }, [fontLoaded, model]);

  if (!fontLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SumjoModelContext.Provider value={model}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SumjoModelContext.Provider>
    </ThemeProvider>
  );
}
