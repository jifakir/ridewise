import type { TransactionRow } from '@/src/database/schema/types';
import { getRideWiseDatabase } from '@/src/database/sqlite';

import { createId, timestampNow } from './support';

export type Expense = {
  id: string;
  amount: number;
  categoryId: string;
  bikeId: string | null;
  date: number;
  note: string | null;
  paymentMethod: string | null;
};

export type NewExpense = {
  amount: number;
  categoryId: string;
  /** Unix ms. Defaults to the moment of saving. */
  date?: number;
  note?: string | null;
  paymentMethod?: string | null;
};

function blankToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toExpense(row: TransactionRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    categoryId: row.category_id,
    bikeId: row.bike_id,
    date: row.date,
    note: row.note,
    paymentMethod: row.payment_method,
  };
}

/**
 * Saves a normal expense. Fuel litres, price, and ODO stay out of this path.
 * bike_id stays empty until the active bike lives in the bikes table.
 */
export async function addExpense(input: NewExpense): Promise<Expense> {
  const amount = Math.round(input.amount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  const db = await getRideWiseDatabase();
  const category = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL`,
    [input.categoryId],
  );
  if (!category) {
    throw new Error('Choose a category before saving.');
  }

  const now = timestampNow();
  const expense: Expense = {
    id: createId(),
    amount,
    categoryId: input.categoryId,
    bikeId: null,
    date: input.date ?? now,
    note: blankToNull(input.note),
    paymentMethod: blankToNull(input.paymentMethod),
  };

  await db.runAsync(
    `INSERT INTO transactions (id, amount, category_id, bike_id, date, note, payment_method, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.amount,
      expense.categoryId,
      expense.bikeId,
      expense.date,
      expense.note,
      expense.paymentMethod,
      now,
      now,
    ],
  );

  return expense;
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? toExpense(row) : null;
}
