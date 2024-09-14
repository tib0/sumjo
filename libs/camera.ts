import { CameraDevice, CameraDeviceFormat } from "react-native-vision-camera";

export function getBestFormat(
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