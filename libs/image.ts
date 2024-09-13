import { Skia } from '@shopify/react-native-skia';
import * as ImageManipulator from 'expo-image-manipulator';
import { PHOTO_SRC_WIDTH, PHOTO_SRC_HEIGHT } from '@/constants/Image';

export async function resizeImage(uri: string, width: number, height: number) {
  try {    
    const photo2 = await ImageManipulator.manipulateAsync(uri, 
      [{
        crop: {
          height: width,
          width: height,
          originX: (PHOTO_SRC_WIDTH - width) / 2,
          originY: (PHOTO_SRC_HEIGHT - height) / 2,
        }
      }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    return photo2.uri;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export async function getRGBArrayFromUri(uri: string, outputFactor?: number): Promise<number[]> {
  const data = await Skia.Data.fromURI(uri);
  const image = Skia.Image.MakeImageFromEncoded(data);
  if (!image) return [];
  const pixelsResized = image.readPixels(0, 0, image.getImageInfo());
  if (!pixelsResized) return [];

  let oRGB = [];
  try {
    for (let index = 0; index < pixelsResized.length; index += 4) {
      oRGB.push(pixelsResized[index] / (outputFactor ?? 255));
      oRGB.push(pixelsResized[index + 1] / (outputFactor ?? 255));
      oRGB.push(pixelsResized[index + 2] / (outputFactor ?? 255));
    }
    return oRGB;
  } catch (err) {
    console.error(err);
    return [];
  }
} 