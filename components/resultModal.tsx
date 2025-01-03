import { CONTENT_SPACING_Y } from '@/constants/Screen';
import { styleSheet } from '@/libs/styles';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';
import { TouchableOpacity, Modal } from 'react-native';

export function ResultModal(
  { isModalVisible, score, onPress }:
    { isModalVisible: boolean, score: string, onPress: (() => void) | undefined }
) {
  const styles = styleSheet();

  return (
    <Modal animationType='none' transparent={true} visible={isModalVisible}>
      <TouchableOpacity
        style={styles.modalContainer}
        onPress={onPress}
        activeOpacity={1}
        accessibilityLabel='Result modal container'
        accessibilityHint='Click anywhere to close this modal containing detection result.'
        accessibilityActions={[{ name: 'press', label: 'Close this modal' }]}
        accessibilityValue={{ 'text': 'Your score is ' + score }}
      >
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          accessibilityLabel='Result modal'
          accessibilityValue={{ 'text': 'Your score is ' + score }}
        >
          <StrokeText
            text={score}
            fontSize={CONTENT_SPACING_Y * 2.75}
            color='#ffffff'
            strokeColor='#000000'
            strokeWidth={CONTENT_SPACING_Y / 1.5}
            fontFamily='LemonRegular'
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
