import type { ComponentType } from 'react';
import { useWindowDimensions, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type WelcomeArtProps = {
  Art: ComponentType<SvgProps>;
  aspect: number;
};

export function WelcomeArt({ Art, aspect }: WelcomeArtProps) {
  const { width } = useWindowDimensions();
  const maxWidth = Math.min(width - 48, 340);
  const maxHeight = 280;
  let artWidth = maxWidth;
  let artHeight = artWidth / aspect;

  if (artHeight > maxHeight) {
    artHeight = maxHeight;
    artWidth = artHeight * aspect;
  }

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants" className="w-full items-center">
      <Art width={artWidth} height={artHeight} />
    </View>
  );
}
