import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlaceholderScreenProps = {
  title: string;
  nextMilestone: string;
};

export function PlaceholderScreen({ title, nextMilestone }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-canvas px-8" edges={['top']}>
      <Text className="text-center text-2xl font-bold text-foreground">{title}</Text>
      <Text className="mt-2 text-center text-base text-muted">Coming next — {nextMilestone}</Text>
    </SafeAreaView>
  );
}
