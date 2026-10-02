import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ExpenseRow } from '@/src/components/expenses/ExpenseRow';
import type { ExpenseListItem } from '@/src/repositories/expenseRepository';

export function RecentTransactions({ items, unavailable = false }: { items: ExpenseListItem[]; unavailable?: boolean }) {
  const router = useRouter();
  const title = unavailable ? 'Transactions unavailable' : 'No expenses yet';
  const body = unavailable
    ? 'Spending could not be loaded.'
    : 'Add your first expense and it will show up here.';

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
      {items.length === 0 ? (
        <View className="items-center rounded-3xl bg-card px-6 py-10">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Text className="mt-1 text-center text-sm text-muted">{body}</Text>
        </View>
      ) : (
        <View className="overflow-hidden rounded-3xl bg-card">
          {items.map((item, index) => (
            <ExpenseRow key={item.id} item={item} hairline={index > 0} />
          ))}
        </View>
      )}
    </View>
  );
}
