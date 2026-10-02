import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseForm } from '@/src/components/expenses/ExpenseForm';
import { BackButton } from '@/src/components/navigation/BackButton';
import { paymentMethodFromStored } from '@/src/features/expenses/paymentMethods';
import {
  deleteExpense,
  getExpense,
  updateExpense,
  type Expense,
} from '@/src/repositories/expenseRepository';
import { isSameDay } from '@/src/utils/dates';
import { amountInputValue } from '@/src/utils/money';

function StatusScreen({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <View className="flex-1 px-5 pt-2">
        <BackButton onPress={onBack} />
        <View className="mt-5 items-center rounded-3xl bg-card px-6 py-10">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Text className="mt-1 text-center text-sm text-muted">{body}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export function EditExpenseScreen({ id }: { id: string }) {
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getExpense(id)
      .then((row) => {
        if (cancelled) return;
        if (!row) setMissing(true);
        else setExpense(row);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function goBack() {
    router.back();
  }

  if (missing) {
    return (
      <StatusScreen
        title="Expense not found"
        body="It is no longer in your history."
        onBack={goBack}
      />
    );
  }

  if (!expense) {
    return (
      <StatusScreen title="Loading expense" body="The amount and category will show up here." onBack={goBack} />
    );
  }

  const date = new Date(expense.date);
  const paymentMethod = paymentMethodFromStored(expense.paymentMethod);

  return (
    <ExpenseForm
      title="Expense"
      subtitle="Change the amount, category, or details."
      submitLabel="Save Changes"
      edges={['top', 'bottom']}
      onBack={goBack}
      initialAmount={amountInputValue(expense.amount)}
      initialCategoryId={expense.categoryId}
      initialNote={expense.note ?? ''}
      initialPaymentMethod={paymentMethod}
      initialDate={date}
      startWithDetails={Boolean(expense.note || paymentMethod) || !isSameDay(date, new Date())}
      onSubmit={async (draft) => {
        await updateExpense(id, draft);
        goBack();
      }}
      onDelete={async () => {
        await deleteExpense(id);
        goBack();
      }}
    />
  );
}
