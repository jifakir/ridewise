import Svg, { Circle, Rect } from 'react-native-svg';

import { colors } from '@/src/theme/colors';

import { IllustrationFrame } from './IllustrationFrame';

export function SpendIllustration() {
  return (
    <IllustrationFrame>
      <Svg width={168} height={168} viewBox="0 0 168 168">
        <Rect x="36" y="58" width="96" height="68" rx="16" fill={colors.card} />
        <Rect x="36" y="58" width="96" height="68" rx="16" fill="none" stroke={colors.ink} strokeWidth={3} />
        <Rect x="48" y="44" width="72" height="28" rx="8" fill={colors.primary} />
        <Rect x="54" y="80" width="44" height="28" rx="6" fill={colors.canvas} />
        <Circle cx="118" cy="108" r="16" fill={colors.primary} />
        <Circle cx="118" cy="108" r="7" fill={colors.card} />
      </Svg>
    </IllustrationFrame>
  );
}
