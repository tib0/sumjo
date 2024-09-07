import { Dimensions, Platform } from 'react-native'
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'

export const CONTENT_SPACING = 15

const SAFE_BOTTOM =
  Platform.select({
    ios: StaticSafeAreaInsets?.safeAreaInsetsBottom,
  }) ?? 0

export const SAFE_AREA_PADDING = {
  paddingLeft: StaticSafeAreaInsets?.safeAreaInsetsLeft + CONTENT_SPACING,
  paddingTop: StaticSafeAreaInsets?.safeAreaInsetsTop + CONTENT_SPACING,
  paddingRight: StaticSafeAreaInsets?.safeAreaInsetsRight + CONTENT_SPACING,
  paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
}

export const MAX_ZOOM_FACTOR = 1

export const SCREEN_WIDTH = Dimensions.get('window').width
export const SCREEN_HEIGHT = Platform.select<number>({
  android: Dimensions.get('screen').height - StaticSafeAreaInsets?.safeAreaInsetsBottom,
  ios: Dimensions.get('window').height,
}) as number

export const CAPTURE_BUTTON_SIZE = 78

export const CONTROL_BUTTON_SIZE = 40