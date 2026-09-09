import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

export function BikeCard() {
  const router = useRouter();

  return (
    <View className="rounded-3xl bg-card p-5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
      </View>
      <Text className="mt-3 text-sm text-muted">My Bike</Text>
      <Text className="mt-1 text-xl font-bold text-foreground">No bike added yet</Text>
      <Text className="mt-2 text-sm text-muted">Add your bike to track ODO, mileage, and fuel.</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add your bike"
        onPress={() => router.push('/(tabs)/more')}
        className="mt-5 flex-row items-center self-start rounded-full bg-primary px-4 py-2.5 active:opacity-90">
        <Ionicons name="add" size={18} color={colors.white} />
        <Text className="ml-1 font-semibold text-white">Add your bike</Text>
      </Pressable>
    </View>
  );
}
