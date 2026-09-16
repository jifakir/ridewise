import type { SQLiteDatabase } from 'expo-sqlite';

import { MIGRATIONS } from './migrations';
import { TABLE_NAMES } from './schema/tables';

export type { Migration } from './migrations';

export const SCHEMA_VERSION = MIGRATIONS.reduce(
  (max, migration) => Math.max(max, migration.version),
  0,
);

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion > SCHEMA_VERSION) {
    throw new Error(
      `RideWise database version ${currentVersion} is newer than this app (${SCHEMA_VERSION}).`,
    );
  }

  if (currentVersion === SCHEMA_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }

  await db.withTransactionAsync(async () => {
    for (const migration of MIGRATIONS) {
      if (migration.version <= currentVersion) continue;
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  });
}

export async function listUserTables(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  );
  return rows.map((row) => row.name);
}

export async function assertSchema(db: SQLiteDatabase): Promise<void> {
  const tables = await listUserTables(db);
  const missing = TABLE_NAMES.filter((name) => !tables.includes(name));
  if (missing.length > 0) {
    throw new Error(`RideWise schema is missing tables: ${missing.join(', ')}`);
  }
}
