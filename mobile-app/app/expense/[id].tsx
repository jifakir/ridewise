import { useLocalSearchParams } from 'expo-router';

import { EditExpenseScreen } from '@/src/components/expenses/EditExpenseScreen';

export default function ExpenseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditExpenseScreen id={id ?? ''} />;
}
