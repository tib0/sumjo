import { StyleSheet } from "react-native";
import { CONTENT_SPACING_X, CONTENT_SPACING_Y, BOTTOM_SPEC } from '@/constants/Screen';

export const styleSheet = (cameraSize: { width: number, height: number }) => StyleSheet.create({
  appContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingHorizontal: CONTENT_SPACING_X,
    paddingTop: CONTENT_SPACING_Y / 1.25,
    minHeight: '100%',
    paddingBottom: CONTENT_SPACING_Y / 4 + BOTTOM_SPEC,
    backgroundColor: 'lightgreen'
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
    opacity: .6
  },
  overlayBottom: {
    position: 'absolute',
    top: '80%',
    height: '20%',
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
    backgroundColor: 'black',
    opacity: .6
  },
  logo: {
    alignItems: 'center',
    paddingBottom: CONTENT_SPACING_Y / 3,
  },
  cameraBox: {
    flex: 4,
    width: cameraSize.width,
    height: cameraSize.height,
    borderRadius: CONTENT_SPACING_Y / 3,
    backgroundColor: 'black',
    overflow: 'hidden',
  },
  bottomButtonRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingBottom: CONTENT_SPACING_Y / 4,
  },
  button: {
    width: '100%',
    height: CONTENT_SPACING_Y * 1.75,
    borderRadius: CONTENT_SPACING_Y / 3,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { 
    color: 'white', 
    fontSize: 46 / 1.75,
    fontFamily: 'LemonRegular'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
  modalContent: {
    height: 350,
    width: '100%',
    backgroundColor: '#25292e',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    height: 32,
    backgroundColor: '#464C55',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 18,
  },
  modal: {
    width: '100%',
    height: 350
  },
  result: {
    color: '#fff',
    fontSize: 36,
  },
  resultDetail: {
    color: '#fff',
    fontSize: 18,
  },
});
