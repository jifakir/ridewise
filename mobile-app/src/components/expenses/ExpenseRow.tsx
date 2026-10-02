import { useRouter } from 'expo-router';

import { SpendRow } from '@/src/components/SpendRow';
import type { ExpenseListItem } from '@/src/repositories/expenseRepository';

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

  return (
    <SpendRow
      icon={item.categoryIcon}
      label={item.categoryName}
      amount={item.amount}
      detail={detailLine(item)}
      hairline={hairline}
      onPress={() => router.push(`/expense/${item.id}`)}
    />
  );
}
