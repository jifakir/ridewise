import type { CategoryRow, CategoryType } from '@/src/database/schema/types';
import { getRideWiseDatabase } from '@/src/database/sqlite';

import { createId, fromFlag, timestampNow } from './support';

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  type: CategoryType;
  isDefault: boolean;
  sortOrder: number;
};

export type NewCategory = {
  name: string;
  type: CategoryType;
  icon?: string | null;
};

export type CategoryChanges = {
  name?: string;
  icon?: string | null;
  sortOrder?: number;
};

const SELECT_ACTIVE = `SELECT * FROM categories WHERE deleted_at IS NULL`;
const ORDER_BY = `ORDER BY sort_order ASC, name ASC`;
/** Money first, bike second. */
const ORDER_BY_TYPE = `ORDER BY CASE type WHEN 'general' THEN 0 ELSE 1 END, sort_order ASC, name ASC`;

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    isDefault: fromFlag(row.is_default),
    sortOrder: row.sort_order,
  };
}

export async function listCategories(): Promise<Category[]> {
  const db = await getRideWiseDatabase();
  const rows = await db.getAllAsync<CategoryRow>(`${SELECT_ACTIVE} ${ORDER_BY_TYPE}`);
  return rows.map(toCategory);
}

export async function listCategoriesByType(type: CategoryType): Promise<Category[]> {
  const db = await getRideWiseDatabase();
  const rows = await db.getAllAsync<CategoryRow>(`${SELECT_ACTIVE} AND type = ? ${ORDER_BY}`, [
    type,
  ]);
  return rows.map(toCategory);
}

export async function getCategory(id: string): Promise<Category | null> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<CategoryRow>(`${SELECT_ACTIVE} AND id = ?`, [id]);
  return row ? toCategory(row) : null;
}

export async function createCategory(input: NewCategory): Promise<Category> {
  const name = input.name.trim();
  if (name.length === 0) {
    throw new Error('Category name is required.');
  }

  const db = await getRideWiseDatabase();
  const last = await db.getFirstAsync<{ max_sort_order: number | null }>(
    `SELECT MAX(sort_order) AS max_sort_order FROM categories WHERE type = ?`,
    [input.type],
  );

  const category: Category = {
    id: createId(),
    name,
    icon: input.icon ?? null,
    type: input.type,
    isDefault: false,
    sortOrder: (last?.max_sort_order ?? -1) + 1,
  };
  const now = timestampNow();

  await db.runAsync(
    `INSERT INTO categories (id, name, icon, type, is_default, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
    [category.id, category.name, category.icon, category.type, category.sortOrder, now, now],
  );

  return category;
}

export async function updateCategory(id: string, changes: CategoryChanges): Promise<Category> {
  const current = await getCategory(id);
  if (!current) {
    throw new Error(`Category ${id} was not found.`);
  }

  const name = changes.name === undefined ? current.name : changes.name.trim();
  if (name.length === 0) {
    throw new Error('Category name is required.');
  }

  const next: Category = {
    ...current,
    name,
    icon: changes.icon === undefined ? current.icon : changes.icon,
    sortOrder: changes.sortOrder ?? current.sortOrder,
  };

  const db = await getRideWiseDatabase();
  await db.runAsync(
    `UPDATE categories SET name = ?, icon = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
    [next.name, next.icon, next.sortOrder, timestampNow(), id],
  );

  return next;
}

/**
 * Soft delete: transactions keep pointing at the category so history stays readable.
 * Default categories are kept so the picker always has a usable set.
 */
export async function deleteCategory(id: string): Promise<void> {
  const category = await getCategory(id);
  if (!category) {
    return;
  }
  if (category.isDefault) {
    throw new Error('Default categories cannot be deleted.');
  }

  const db = await getRideWiseDatabase();
  const now = timestampNow();
  await db.runAsync(`UPDATE categories SET deleted_at = ?, updated_at = ? WHERE id = ?`, [
    now,
    now,
    id,
  ]);
}
