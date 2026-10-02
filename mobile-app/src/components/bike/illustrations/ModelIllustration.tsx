import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function ModelIllustration({ size = 80 }: { size?: number }) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <MaterialCommunityIcons name="motorbike" size={size} color={colors.ink} />
    </View>
  );
}
