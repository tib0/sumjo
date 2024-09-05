import ImageResizer from '@bam.tech/react-native-image-resizer';
import { Skia } from '@shopify/react-native-skia';

export async function resizeImage(uri: string, width: number, height: number) {
  try {
    const response = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100, 0, undefined, true, { mode: 'stretch' });
    return response.uri;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export async function getRGBArrayFromUri(uri: string, outputFactor?: number): Promise<Array<number>> {
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