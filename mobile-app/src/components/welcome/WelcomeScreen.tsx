import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MotorbikeIllustration } from '@/src/components/welcome/illustrations/MotorbikeIllustration';
import { OfflineIllustration } from '@/src/components/welcome/illustrations/OfflineIllustration';
import { SpendIllustration } from '@/src/components/welcome/illustrations/SpendIllustration';

const SLIDES = [
  {
    title: 'Your Money',
    body: 'Log food, bills, and daily spend.',
    Illustration: SpendIllustration,
  },
  {
    title: 'Motorbike',
    body: 'Fuel, service, and riding costs.',
    Illustration: MotorbikeIllustration,
  },
  {
    title: 'On this phone',
    body: 'Offline. No account. Data stays here.',
    Illustration: OfflineIllustration,
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
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        className="flex-1">
        {SLIDES.map(({ title, body, Illustration }) => (
          <View key={title} style={{ width }} className="flex-1 justify-center px-5">
            <Illustration />
            <Text className="mt-6 text-center text-3xl font-bold text-foreground">{title}</Text>
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
