import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function RecentTransactions() {
  const router = useRouter();

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-foreground">Recent Transactions</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all transactions"
          onPress={() => router.push('/(tabs)/transactions')}
          className="active:opacity-70">
          <Text className="text-sm font-semibold text-primary">View All</Text>
        </Pressable>
      </View>
      <View className="items-center rounded-3xl bg-card px-6 py-10">
        <Text className="text-base font-semibold text-foreground">No expenses yet</Text>
        <Text className="mt-1 text-center text-sm text-muted">
          Add your first expense and it will show up here.
        </Text>
      </View>
    </View>
  );
}
