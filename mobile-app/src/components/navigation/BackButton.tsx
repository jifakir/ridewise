import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-card active:opacity-70">
      <Ionicons name="chevron-back" size={20} color={colors.foreground} />
    </Pressable>
  );
}
