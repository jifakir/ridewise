import { useRef, useState, type ComponentType } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrivateArt from '@/assets/images/undraw_private-data_934y.svg';
import TravelingArt from '@/assets/images/undraw_traveling_c18z.svg';
import WalletArt from '@/assets/images/undraw_wallet_diag.svg';
import { WelcomeArt } from '@/src/components/welcome/illustrations/WelcomeArt';

const SLIDES: {
  title: string;
  body: string;
  Art: ComponentType<SvgProps>;
  aspect: number;
}[] = [
  {
    title: 'Your Money',
    body: 'Food, bills, and daily spend, together in one place.',
    Art: WalletArt,
    aspect: 800.272 / 594.547,
  },
  {
    title: 'My Bike',
    body: 'Fuel, service, and the cost of riding.',
    Art: TravelingArt,
    aspect: 610 / 435.02908,
  },
  {
    title: 'On this phone',
    body: 'No account. It works offline, and your data stays here.',
    Art: PrivateArt,
    aspect: 854.515 / 800,
  },
];

type WelcomeScreenProps = {
  busy?: boolean;
  onGetStarted: () => void;
};

export function WelcomeScreen({ busy = false, onGetStarted }: WelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const lastSlide = index === SLIDES.length - 1;

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
  }

  function handleNext() {
    if (lastSlide) {
      onGetStarted();
      return;
    }
    const next = index + 1;
    scrollRef.current?.scrollTo({ x: width * next, animated: true });
    setIndex(next);
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <View className="h-11 flex-row items-center justify-between px-5">
        <Text className="text-base font-bold text-foreground">RideWise</Text>
        {lastSlide ? (
          <View className="w-10" />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={onGetStarted}
            className="py-2 active:opacity-70">
            <Text className="text-sm font-semibold text-muted">Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerClassName="grow">
        {SLIDES.map(({ title, body, Art, aspect }) => (
          <View key={title} style={{ width }} className="grow items-center justify-center px-5">
            <WelcomeArt Art={Art} aspect={aspect} />
            <Text className="mt-8 text-center text-3xl font-bold text-foreground">{title}</Text>
            <Text className="mt-3 text-center text-base leading-6 text-muted">{body}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center justify-center gap-2 pb-5">
        {SLIDES.map((slide, slideIndex) => (
          <View
            key={slide.title}
            className={
              slideIndex === index ? 'h-2 w-6 rounded-full bg-primary' : 'h-2 w-2 rounded-full bg-ink/15'
            }
          />
        ))}
      </View>

      <View className="px-5 pb-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={lastSlide ? 'Get started' : 'Next'}
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={handleNext}
          className={
            busy
              ? 'items-center justify-center rounded-full bg-primary py-3.5 opacity-70'
              : 'items-center justify-center rounded-full bg-primary py-3.5 active:opacity-90'
          }>
          <Text className="text-base font-semibold text-white">
            {lastSlide ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
