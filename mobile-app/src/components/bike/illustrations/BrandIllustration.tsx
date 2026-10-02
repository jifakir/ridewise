import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/src/theme/colors';

/** Tank badge — the emblem that names the maker. */
export function BrandIllustration({ size = 86 }: { size?: number }) {
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path
          d="M60 18 L98 33 V62 C98 83 82 97 60 104 C38 97 22 83 22 62 V33 Z"
          fill={colors.ink}
        />
        <Path d="M60 43 L77 62 L60 81 L43 62 Z" fill={colors.primary} />
      </Svg>
    </View>
  );
}
