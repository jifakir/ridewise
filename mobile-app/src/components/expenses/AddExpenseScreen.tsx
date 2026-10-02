import { ExpenseForm } from '@/src/components/expenses/ExpenseForm';
import { addExpense } from '@/src/repositories/expenseRepository';

export function AddExpenseScreen() {
  return (
    <ExpenseForm
      title="Add Expense"
      subtitle="Log food, bills, and the bike."
      submitLabel="Save Expense"
      resetOnSuccess
      onSubmit={async (draft) => {
        await addExpense(draft);
      }}
    />
  );
}
