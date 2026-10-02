import type { CategoryType, TransactionRow } from '@/src/database/schema/types';
import { getRideWiseDatabase } from '@/src/database/sqlite';

import { blankToNull, createId, timestampNow } from './support';

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
  /** Inclusive local timestamp. */
  from?: number;
  /** Exclusive local timestamp. */
  to?: number;
  limit?: number;
};

export type MonthlyTotals = {
  total: number;
  daily: number;
  bike: number;
  count: number;
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

function roundAmount(amount: number): number {
  const rounded = Math.round(amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
  return rounded;
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
 * Saves a normal expense. Fuel litres, price, and ODO go through the fuel log.
 * bike_id stays empty on this path.
 */
export async function addExpense(input: NewExpense): Promise<Expense> {
  const amount = roundAmount(input.amount);

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
  const from = query.from ?? null;
  const to = query.to ?? null;
  const limit = query.limit ?? -1;
  const rows = await db.getAllAsync<ExpenseListRow>(
    `SELECT
       t.id, t.amount, t.category_id, t.bike_id, t.date, t.note, t.payment_method,
       t.created_at, t.updated_at, t.deleted_at,
       c.name AS category_name, c.icon AS category_icon, c.type AS category_type
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.deleted_at IS NULL
       AND (? IS NULL OR c.type = ?)
       AND (? IS NULL OR t.date >= ?)
       AND (? IS NULL OR t.date < ?)
       AND (
         ? IS NULL
         OR c.name LIKE ? ESCAPE '\\'
         OR IFNULL(t.note, '') LIKE ? ESCAPE '\\'
         OR IFNULL(t.payment_method, '') LIKE ? ESCAPE '\\'
         OR CAST(t.amount AS TEXT) LIKE ? ESCAPE '\\'
       )
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [type, type, from, from, to, to, search, search, search, search, search, limit],
  );
  return rows.map(toListItem);
}

function roundTaka(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Spending in [start, end), split by Daily (general) and Bike categories. */
export async function monthlyTotals(start: number, end: number): Promise<MonthlyTotals> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<{ total: number; daily: number; bike: number; count: number }>(
    `SELECT
       COALESCE(SUM(t.amount), 0) AS total,
       COALESCE(SUM(CASE WHEN c.type = 'general' THEN t.amount ELSE 0 END), 0) AS daily,
       COALESCE(SUM(CASE WHEN c.type = 'bike' THEN t.amount ELSE 0 END), 0) AS bike,
       COUNT(t.id) AS count
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.deleted_at IS NULL
       AND t.date >= ?
       AND t.date < ?`,
    [start, end],
  );
  return {
    total: roundTaka(row?.total ?? 0),
    daily: roundTaka(row?.daily ?? 0),
    bike: roundTaka(row?.bike ?? 0),
    count: row?.count ?? 0,
  };
}

export async function getExpense(id: string): Promise<Expense | null> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? toExpense(row) : null;
}

export type ExpenseChanges = {
  amount: number;
  categoryId: string;
  date: number;
  note?: string | null;
  paymentMethod?: string | null;
};

export async function updateExpense(id: string, changes: ExpenseChanges): Promise<Expense> {
  const amount = roundAmount(changes.amount);
  const db = await getRideWiseDatabase();
  const current = await db.getFirstAsync<TransactionRow>(
    `SELECT * FROM transactions WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  if (!current) {
    throw new Error('This expense is no longer in your history.');
  }

  const category = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL`,
    [changes.categoryId],
  );
  if (!category) {
    throw new Error('Choose a category before saving.');
  }

  const now = timestampNow();
  const expense: Expense = {
    id,
    amount,
    categoryId: changes.categoryId,
    bikeId: current.bike_id,
    date: changes.date,
    note: blankToNull(changes.note),
    paymentMethod: blankToNull(changes.paymentMethod),
  };

  await db.runAsync(
    `UPDATE transactions
     SET amount = ?, category_id = ?, date = ?, note = ?, payment_method = ?, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [expense.amount, expense.categoryId, expense.date, expense.note, expense.paymentMethod, now, id],
  );

  return expense;
}

/** Soft delete so a later restore can still see the row. */
export async function deleteExpense(id: string): Promise<void> {
  const db = await getRideWiseDatabase();
  const now = timestampNow();
  await db.runAsync(
    `UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [now, now, id],
  );
}
