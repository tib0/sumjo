import { StyleSheet } from "react-native";
import { SCREEN_WIDTH, SCREEN_HEIGHT, CONTENT_SPACING_X, CONTENT_SPACING_Y, BOTTOM_SPEC } from '@/constants/Screen';

const cameraSize = {
  width: SCREEN_WIDTH - (CONTENT_SPACING_X * 2),
  height: (SCREEN_HEIGHT / 1.5) - (CONTENT_SPACING_Y * 2)
};

export const styleSheet = () => StyleSheet.create({
  appContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CONTENT_SPACING_X,
    paddingTop: CONTENT_SPACING_Y / 1.25,
    minHeight: '100%',
    paddingBottom: CONTENT_SPACING_Y / 4 + BOTTOM_SPEC,
    backgroundColor: 'lightgreen'
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: '0%',
    height: '20%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'black',
    opacity: .7
  },
  overlayBottom: {
    position: 'absolute',
    top: '80%',
    height: '20%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'black',
    opacity: .7
  },
  overlayBorder: {
    position: 'absolute',
    top: '0%',
    height: '100%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
    borderWidth: CONTENT_SPACING_Y / 4.5,
    borderRadius: CONTENT_SPACING_Y / 3,
    borderColor: 'black',
  },
  logo: {
    alignItems: 'center',
    paddingBottom: CONTENT_SPACING_Y / 3,
  },
  cameraBox: {
    flex: 4,
    width: cameraSize?.width,
    height: cameraSize?.height,
    borderRadius: CONTENT_SPACING_Y / 3,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  bottomButtonRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: CONTENT_SPACING_Y / 4,
  },
  button: {
    height: CONTENT_SPACING_Y * 1.75,
    borderRadius: CONTENT_SPACING_Y / 3,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: CONTENT_SPACING_Y / 1.5,
    fontFamily: 'LemonRegular'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  modal: {
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: CONTENT_SPACING_X / 2,
    maxWidth: SCREEN_WIDTH - (CONTENT_SPACING_X * 2),
    maxHeight: SCREEN_HEIGHT - (CONTENT_SPACING_Y * 2),
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'LemonRegular'
  },
});
