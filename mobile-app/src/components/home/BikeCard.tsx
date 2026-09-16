import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { colors } from '@/src/theme/colors';

function formatOdo(km: number) {
  return `${km.toLocaleString('en-US')} km`;
}

export function BikeCard() {
  const { bike } = useWelcomeGate();

  if (!bike) {
    return (
      <View className="rounded-3xl bg-card p-5">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
        </View>
        <Text className="mt-3 text-sm text-muted">My Bike</Text>
        <Text className="mt-1 text-xl font-bold text-foreground">No motorbike yet</Text>
        <Text className="mt-2 text-sm text-muted">Add brand, model, and ODO to start tracking.</Text>
      </View>
    );
  }

  return (
    <View className="rounded-3xl bg-card p-5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
      </View>
      <Text className="mt-3 text-sm text-muted">My Bike</Text>
      <Text className="mt-1 text-xl font-bold text-foreground">
        {bike.brand} {bike.model}
      </Text>
      <Text className="mt-2 text-sm text-muted">ODO {formatOdo(bike.currentOdo)}</Text>
    </View>
  );
}
