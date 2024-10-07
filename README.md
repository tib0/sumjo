<p align="center">
  <img src="assets/images/icon.png" style="max-width: 400px" />
</p>
Sumjo is an image recognition application that let you get your results on Skyjo end game board.

SKYJO (by Magilano) is an entertaining card game for 7-99. The ideal game for fun, entertaining and exciting want you to trade and collects card in a minimum amount.

- [💻 Install](#install)
- [📸 Screenshots](#screenshots)
- [❔️ How it Works](#how-it-works)
- [⬇️ Use from sources](#use-from-sources)
- [👨‍💼 Dependencies](#dependencies)
- [📜 License](#license)

## Install

The application can be installed via the Google Play Store or Mac App Store on mobile device.

## Screenshots

## How it works

### App usage

At the end of a Skyjo game run the app take a picture of your board state by touching the button, then the result will appear on the screen.

### Internally

I used models and training data sample available here https://universe.roboflow.com/elmurd0r/skyjo to train a TFLite model with Yolo https://github.com/ultralytics/yolov5. I used Expo (https://expo.dev/) to power the app with code written in React Native. The model itself run with https://github.com/mrousavy/react-native-fast-tflite wich rely on TensorFlow Lite. To handle camera I use https://github.com/mrousavy/react-native-vision-camera. The picture is then cropped using Skia https://github.com/shopify/react-native-skia.

## Use from sources

Clone this project, install dependencies and then from the project folder run :

For iOS

```
npx expo run:android --variant release
```

For Android

```
npx expo run:ios --configuration Release --device
```

## Dependencies

## License
