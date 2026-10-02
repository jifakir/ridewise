import Svg, { Path, Rect } from 'react-native-svg';

import { colors } from '@/src/theme/colors';

import { IllustrationFrame } from './IllustrationFrame';

export function OfflineIllustration() {
  return (
    <IllustrationFrame>
      <Svg width={168} height={168} viewBox="0 0 168 168">
        <Rect x="52" y="28" width="64" height="112" rx="16" fill={colors.card} />
        <Rect x="52" y="28" width="64" height="112" rx="16" fill="none" stroke={colors.ink} strokeWidth={3} />
        <Rect x="64" y="48" width="40" height="28" rx="8" fill={colors.primary} />
        <Rect x="64" y="84" width="40" height="10" rx="5" fill={colors.canvas} />
        <Rect x="64" y="100" width="28" height="10" rx="5" fill={colors.canvas} />
        <Path
          d="M78 132 H90"
          stroke={colors.ink}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    </IllustrationFrame>
  );
}
