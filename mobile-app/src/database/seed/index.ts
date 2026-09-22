import type { SQLiteDatabase } from 'expo-sqlite';

import { DEFAULT_CATEGORIES } from './defaultCategories';

export { DEFAULT_CATEGORIES, FUEL_CATEGORY_ID, type DefaultCategory } from './defaultCategories';

const INSERT_DEFAULT_CATEGORY = `
INSERT INTO categories (id, name, icon, type, is_default, sort_order, created_at, updated_at)
VALUES (?, ?, ?, ?, 1, ?, ?, ?)
ON CONFLICT (id) DO NOTHING
`;

/**
 * Inserts the default General and Bike categories on first launch.
 * Renamed, re-sorted and soft-deleted defaults are left untouched on later runs.
 */
export async function seedDefaultCategories(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ seeded: number }>(
    'SELECT COUNT(*) AS seeded FROM categories WHERE is_default = 1',
  );
  if ((row?.seeded ?? 0) >= DEFAULT_CATEGORIES.length) {
    return;
  }

  const now = Date.now();

  await db.withTransactionAsync(async () => {
    for (const category of DEFAULT_CATEGORIES) {
      await db.runAsync(INSERT_DEFAULT_CATEGORY, [
        category.id,
        category.name,
        category.icon,
        category.type,
        category.sortOrder,
        now,
        now,
      ]);
    }
  });
}
