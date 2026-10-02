import { Text, View } from 'react-native';

import { monthName } from '@/src/utils/dates';

export function HomeHeader() {
  return (
    <View className="mb-5 flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-2xl font-bold text-foreground">RideWise</Text>
        <Text className="mt-1 text-sm text-muted">Spend smart. Ride more.</Text>
      </View>
      <View className="rounded-full bg-card px-3 py-1.5">
        <Text className="text-sm font-medium text-foreground">{monthName()}</Text>
      </View>
    </View>
  );
}

