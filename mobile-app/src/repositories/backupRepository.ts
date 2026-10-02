import { SCHEMA_VERSION, getRideWiseDatabase } from '@/src/database/sqlite';
import type {
  BikeRow,
  CategoryRow,
  FuelLogRow,
  SettingsRow,
  TransactionRow,
} from '@/src/database/schema/types';
import { BACKUP_APP, BACKUP_FORMAT, type RideWiseBackup } from '@/src/features/backup/document';

import { timestampNow } from './support';

/**
 * Every local row, including ones the user has deleted, so a later restore can rebuild the phone.
 */
export async function exportBackup(): Promise<RideWiseBackup> {
  const db = await getRideWiseDatabase();
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const [settings, bikes, categories, transactions, fuelLogs] = await Promise.all([
    db.getAllAsync<SettingsRow>('SELECT * FROM settings ORDER BY id'),
    db.getAllAsync<BikeRow>('SELECT * FROM bikes ORDER BY id'),
    db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY type, sort_order, id'),
    db.getAllAsync<TransactionRow>('SELECT * FROM transactions ORDER BY date, id'),
    db.getAllAsync<FuelLogRow>('SELECT * FROM fuel_logs ORDER BY created_at, id'),
  ]);

  return {
    app: BACKUP_APP,
    format: BACKUP_FORMAT,
    schemaVersion: version?.user_version ?? SCHEMA_VERSION,
    exportedAt: timestampNow(),
    settings,
    bikes,
    categories,
    transactions,
    fuel_logs: fuelLogs,
  };
}
