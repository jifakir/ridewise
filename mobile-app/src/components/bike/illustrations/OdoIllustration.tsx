import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/src/theme/colors';

import { SetupIllustrationFrame } from './SetupIllustrationFrame';

export function OdoIllustration() {
  return (
    <SetupIllustrationFrame>
      <Svg width={124} height={124} viewBox="0 0 168 168">
        <Circle cx="84" cy="84" r="52" fill={colors.card} />
        <Circle cx="84" cy="84" r="52" fill="none" stroke={colors.ink} strokeWidth={4} />
        <Circle cx="84" cy="84" r="40" fill="none" stroke={colors.canvas} strokeWidth={6} />

        <Path d="M84 40 V50" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M116 52 L110 60" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M124 84 H114" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M116 116 L110 108" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M52 52 L58 60" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M44 84 H54" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />
        <Path d="M52 116 L58 108" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" />

        <Path
          d="M84 84 L118 62"
          stroke={colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Circle cx="84" cy="84" r="7" fill={colors.ink} />
        <Circle cx="84" cy="84" r="3" fill={colors.primary} />

        <Rect x="54" y="108" width="60" height="16" rx="4" fill={colors.ink} />
        <Rect x="58" y="112" width="8" height="8" rx="1" fill={colors.card} />
        <Rect x="68" y="112" width="8" height="8" rx="1" fill={colors.card} />
        <Rect x="78" y="112" width="8" height="8" rx="1" fill={colors.card} />
        <Rect x="88" y="112" width="8" height="8" rx="1" fill={colors.card} />
        <Rect x="98" y="112" width="8" height="8" rx="1" fill={colors.primary} />
      </Svg>
    </SetupIllustrationFrame>
  );
}
