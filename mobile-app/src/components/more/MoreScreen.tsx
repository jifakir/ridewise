import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatOdo } from '@/src/features/bikes/odo';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { colors } from '@/src/theme/colors';

export function MoreScreen() {
  const router = useRouter();
  const { bike } = useWelcomeGate();

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-2xl font-bold text-foreground">More</Text>
          <Text className="mt-1 text-sm text-muted">Your motorbike on this phone.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={bike ? `My Bike, ${bike.brand} ${bike.model}` : 'My Bike'}
          onPress={() => router.push('/bike')}
          className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
            <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="text-xs text-muted">My Bike</Text>
            <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
              {bike ? `${bike.brand} ${bike.model}` : 'No motorbike yet'}
            </Text>
            {bike ? (
              <Text className="mt-0.5 text-sm text-muted">ODO {formatOdo(bike.currentOdo)}</Text>
            ) : null}
          </View>
          <Text className="text-sm font-semibold text-primary">{bike ? 'Change' : 'Add'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
