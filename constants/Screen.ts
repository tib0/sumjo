import { Dimensions, Platform } from 'react-native'

export const CONTENT_SPACING = 15

const SAFE_BOTTOM =
  Platform.select({
    ios: 40,
  }) ?? 0

export const SAFE_AREA_PADDING = {
  paddingLeft: CONTENT_SPACING,
  paddingTop: CONTENT_SPACING,
  paddingRight: CONTENT_SPACING,
  paddingBottom: SAFE_BOTTOM + CONTENT_SPACING,
}

export const MAX_ZOOM_FACTOR = 1

export const SCREEN_WIDTH = Dimensions.get('window').width
export const SCREEN_HEIGHT = Dimensions.get('window').height

export const CAPTURE_BUTTON_SIZE = 78

export const CONTROL_BUTTON_SIZE = 40