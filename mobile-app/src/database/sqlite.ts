import * as SQLite from 'expo-sqlite';

import { assertSchema, migrate, SCHEMA_VERSION } from './migrate';

export const DATABASE_NAME = 'ridewise.db';

export { SCHEMA_VERSION };

let openPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await migrate(db);
  await assertSchema(db);
  return db;
}

export function openRideWiseDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!openPromise) {
    openPromise = openAndMigrate().catch((error) => {
      openPromise = null;
      throw error;
    });
  }
  return openPromise;
}

export async function getRideWiseDatabase(): Promise<SQLite.SQLiteDatabase> {
  return openRideWiseDatabase();
}
