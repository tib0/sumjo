<p align="center">
  <img src="assets/images/icon.png" width="120px" />
</p>

**Sumjo** is an image recognition application that let you get your results on Skyjo (c) end game board.

SKYJO (Copyright by Magilano) is an entertaining card game for 7-99.
In this captivating game, the aim is to keep point aggregation to a bare minimum across multiple rounds. At the conclusion of each round, the scores are meticulously recorded and aggregated into each player's overall sum. The instant any player surpasses 100 points or more, the game terminates, and the player who has managed to retain the fewest points shall be proclaimed the triumphant victor.

- [💻 Install](#install)
- [📸 Screenshots](#screenshots)
- [🎥 Demo](#demo)
- [❔️ How it Works](#how-it-works)
- [⬇️ Use from sources](#use-from-sources)
- [📜 License](#license)

## Install

~~The application can be installed via the Google Play Store or Mac App Store on mobile device.~~ --> Soon (maybe), for now you have to build it yourself... see [⬇️ Use from sources](#use-from-sources)

## Screenshots

<p align="center">
  <img src="assets/images/screenshots/SUMJO_icon.webp" width="60px" />
</p>

<p align="center">
  <img src="assets/images/screenshots/SUMJO_inapp_1.webp" width="120px" />
</p>

<p align="center">
  <img src="assets/images/screenshots/SUMJO_inapp_2.webp" width="120px" />
</p>

## Demo

<div align="center">
  <a href="https://www.youtube.com/watch?v=WRWxTETLeCU">
    <img src="assets/images/screenshots/SUMJO_splash.webp" width="120px">
  </a>
</div>

## How it works

### App usage

At the end of a Skyjo game run the app take a picture of your board state by touching the button, then the result will appear on the screen.

### Internally

I used models and training data sample available here https://universe.roboflow.com/elmurd0r/skyjo to train a TFLite model with Yolo https://github.com/ultralytics/yolov5. I used Expo (https://expo.dev/) to power the app with code written in React Native. The model itself run with https://github.com/mrousavy/react-native-fast-tflite wich rely on TensorFlow Lite library and expose it to my react components. To handle camera I use https://github.com/mrousavy/react-native-vision-camera. The picture is then cropped and resized using Skia https://github.com/shopify/react-native-skia.

## Use from sources

Clone this project, install dependencies and then from the project folder run command below.

### Setup your Expo env:

https://docs.expo.dev/get-started/set-up-your-environment/

### For Android:

https://docs.expo.dev/workflow/android-studio-emulator/

```
npx expo run:android
```

### For iOS:

https://docs.expo.dev/workflow/ios-simulator/

```
npx expo run:ios
```

## License

CC-BY-NC-ND :

> ##
>
> #### You are free to:
>
> - **Share** — copy and redistribute the material in any medium or format. The licensor cannot
>   revoke these freedoms as long as you follow the license terms.
>
> #### Under the following terms:
>
> - **Attribution** — You must give appropriate credit, provide a link to the license, and
>   indicate if changes were made . You may do so in any reasonable manner, but not in any way
>   that suggests the licensor endorses you or your use.
> - **Non Commercial** — You may not use the material for commercial purposes .
> - **No Derivatives** — If you remix, transform, or build upon the material, you may not
>   distribute the modified material.
> - **No additional restrictions** — You may not apply legal terms or technological measures
>   that legally restrict others from doing anything the license permits.
>
> #### Notices:
>
> You do not have to comply with the license for elements of the material in the public domain
> or where your use is permitted by an applicable exception or limitation.
>
> #### No warranties are given:
>
> The license may not give you all of the permissions necessary for your intended use. For
> example, other rights such as publicity, privacy, or moral rights may limit how you use the
> material.
>
> ##
>
> _Find out more [here](./LICENCE.md)_
