import { styleSheet } from '@/libs/styles';
import { Text } from 'react-native';
import { PressableOpacity } from 'react-native-pressable-opacity';

export function Button({ onPress, text }: { onPress?: () => Promise<void>, text: string }) {
  const styles = styleSheet();

  return (
    <PressableOpacity 
      style={styles.button} 
      onPress={() => onPress ? onPress() : undefined} 
      activeOpacity={.8}
    >
      <Text style={styles.buttonText}>
        {text}
      </Text>
    </PressableOpacity>
  );
}