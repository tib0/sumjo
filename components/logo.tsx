import { CONTENT_SPACING_Y } from '@/constants/Screen';
import { styleSheet } from '@/libs/styles';
import { StrokeText } from '@charmy.tech/react-native-stroke-text';
import { View } from 'react-native';

export function Logo() {
  const styles = styleSheet();

  return (
    <View style={styles.logo}>
      <StrokeText
        text='SumjO'
        fontSize={CONTENT_SPACING_Y * 1.5}
        color='#ffffff'
        strokeColor='#000000'
        strokeWidth={CONTENT_SPACING_Y / 2}
        fontFamily='LemonRegular'
      />
    </View>
  );
}