import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { formatBdt } from '@/src/utils/money';

export function MonthlySpendingCard({ total, count, unavailable = false }: { total: number; count: number; unavailable?: boolean }) {
  const router = useRouter();
  const helper = unavailable
    ? 'Spending could not be loaded.'
    : count === 0
      ? 'No spending recorded yet'
      : count === 1
        ? '1 expense this month'
        : `${count} expenses this month`;

  return (
    <View className="rounded-3xl bg-card p-5">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name="cash-outline" size={20} color={colors.primary} />
      </View>
      <Text className="mt-3 text-sm text-muted">Total Spent This Month</Text>
      <Text className="mt-1 text-4xl font-bold text-primary">{formatBdt(total)}</Text>
      <Text className="mt-2 text-sm text-muted">{helper}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add expense"
        onPress={() => router.push('/(tabs)/add')}
        className="mt-5 flex-row items-center justify-center rounded-full bg-primary py-3.5 active:opacity-90">
        <Ionicons name="add" size={20} color={colors.white} />
        <Text className="ml-1 text-base font-semibold text-white">Add Expense</Text>
      </Pressable>
    </View>
  );
}
