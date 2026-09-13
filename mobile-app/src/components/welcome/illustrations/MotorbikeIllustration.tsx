import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/src/theme/colors';

import { IllustrationFrame } from './IllustrationFrame';

export function MotorbikeIllustration() {
  return (
    <IllustrationFrame>
      <Svg width={168} height={168} viewBox="0 0 168 168">
        <Circle cx="48" cy="116" r="20" fill="none" stroke={colors.ink} strokeWidth={4} />
        <Circle cx="48" cy="116" r="6" fill={colors.ink} />
        <Circle cx="124" cy="116" r="20" fill="none" stroke={colors.ink} strokeWidth={4} />
        <Circle cx="124" cy="116" r="6" fill={colors.ink} />

        <Rect x="62" y="78" width="46" height="22" rx="8" fill={colors.ink} />
        <Rect x="70" y="98" width="28" height="18" rx="4" fill={colors.card} stroke={colors.ink} strokeWidth={3} />

        <Path
          d="M48 116 L70 108 H98 L124 116"
          fill="none"
          stroke={colors.ink}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M108 86 L124 116"
          fill="none"
          stroke={colors.ink}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Path
          d="M104 80 L118 68 H130"
          fill="none"
          stroke={colors.ink}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="132" cy="80" r="7" fill={colors.primary} />
        <Path
          d="M72 116 C78 124 92 126 104 118"
          fill="none"
          stroke={colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    </IllustrationFrame>
  );
}
