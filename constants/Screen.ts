import { Dimensions, Platform } from 'react-native';

export const CONTENT_SPACING_X = 20;
export const CONTENT_SPACING_Y = 46;
export const BOTTOM_SPEC = Platform.OS == 'ios' ? 0 : -12
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;