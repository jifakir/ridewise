import type { CategoryType, TransactionRow } from '@/src/database/schema/types';
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

export type ExpenseTypeFilter = 'all' | CategoryType;

export type ExpenseListItem = Expense & {
  categoryName: string;
  categoryIcon: string | null;
  categoryType: CategoryType;
};

export type ExpenseListQuery = {
  search?: string;
  type?: ExpenseTypeFilter;
};

type ExpenseListRow = TransactionRow & {
  category_name: string;
  category_icon: string | null;
  category_type: CategoryType;
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

function likePattern(search: string | undefined): string | null {
  const trimmed = search?.trim().replace(/^৳/, '').replace(/,/g, '') ?? '';
  if (!trimmed) return null;
  const escaped = trimmed.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
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

function toListItem(row: ExpenseListRow): ExpenseListItem {
  return {
    ...toExpense(row),
    categoryName: row.category_name,
    categoryIcon: row.category_icon,
    categoryType: row.category_type,
  };
}

export async function listExpenses(query: ExpenseListQuery = {}): Promise<ExpenseListItem[]> {
  const db = await getRideWiseDatabase();
  const type = query.type && query.type !== 'all' ? query.type : null;
  const search = likePattern(query.search);
  const rows = await db.getAllAsync<ExpenseListRow>(
    `SELECT
       t.id, t.amount, t.category_id, t.bike_id, t.date, t.note, t.payment_method,
       t.created_at, t.updated_at, t.deleted_at,
       c.name AS category_name, c.icon AS category_icon, c.type AS category_type
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.deleted_at IS NULL
       AND (? IS NULL OR c.type = ?)
       AND (
         ? IS NULL
         OR c.name LIKE ? ESCAPE '\\'
         OR IFNULL(t.note, '') LIKE ? ESCAPE '\\'
         OR IFNULL(t.payment_method, '') LIKE ? ESCAPE '\\'
         OR CAST(t.amount AS TEXT) LIKE ? ESCAPE '\\'
       )
     ORDER BY t.date DESC, t.created_at DESC`,
    [type, type, search, search, search, search, search],
  );
  return rows.map(toListItem);
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? toExpense(row) : null;
}
