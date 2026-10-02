import { ExpenseForm } from '@/src/components/expenses/ExpenseForm';
import { FUEL_CATEGORY_ID } from '@/src/database/seed';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { addExpense } from '@/src/repositories/expenseRepository';
import { addFuel } from '@/src/repositories/fuelRepository';

export function AddExpenseScreen() {
  const { bike, noteBike } = useWelcomeGate();

  return (
    <ExpenseForm
      title="Add Expense"
      subtitle="Log food, bills, and the bike."
      submitLabel="Save Expense"
      resetOnSuccess
      captureFuel
      activeOdo={bike?.currentOdo ?? null}
      onSubmit={async (draft) => {
        if (draft.fuel && draft.categoryId === FUEL_CATEGORY_ID) {
          const saved = await addFuel({
            amount: draft.amount,
            date: draft.date,
            note: draft.note,
            paymentMethod: draft.paymentMethod,
            ...draft.fuel,
          });
          noteBike(saved);
          return;
        }
        await addExpense(draft);
      }}
    />
  );
}
