import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { ExpenseListItem } from '@/src/repositories/expenseRepository';
import { colors } from '@/src/theme/colors';
import { iconName } from '@/src/utils/icons';
import { formatBdt } from '@/src/utils/money';

type ExpenseRowProps = {
  item: ExpenseListItem;
  hairline?: boolean;
};

function detailLine(item: ExpenseListItem): string | null {
  const parts = [item.note, item.paymentMethod].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function ExpenseRow({ item, hairline = false }: ExpenseRowProps) {
  const router = useRouter();
  const detail = detailLine(item);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.categoryName}, ${formatBdt(item.amount)}`}
      onPress={() => router.push(`/expense/${item.id}`)}
      className={`flex-row items-center px-4 py-3 active:opacity-70 ${hairline ? 'border-t border-black/5' : ''}`}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name={iconName(item.categoryIcon)} size={20} color={colors.primary} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
          {item.categoryName}
        </Text>
        {detail ? (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <Text className="ml-3 text-base font-bold text-primary">{formatBdt(item.amount)}</Text>
    </Pressable>
  );
}
