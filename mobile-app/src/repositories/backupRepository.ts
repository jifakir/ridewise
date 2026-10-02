import { SCHEMA_VERSION, getRideWiseDatabase } from '@/src/database/sqlite';
import { seedDefaultCategories } from '@/src/database/seed';
import type {
  BikeRow,
  CategoryRow,
  FuelLogRow,
  SettingsRow,
  TransactionRow,
} from '@/src/database/schema/types';
import { clearLegacyBike } from '@/src/features/bikes/bikeStorage';
import { BACKUP_APP, BACKUP_FORMAT, type RideWiseBackup } from '@/src/features/backup/document';
import type { Bike } from '@/src/repositories/bikeRepository';

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

export type RestoreMode = 'replace' | 'merge';

/**
 * Replace deletes local rows, then loads the file.
 * Merge inserts missing rows and overwrites a row only when the file is newer.
 * Returns the active bike after the import, or null when the file has none.
 */
export async function restoreBackup(backup: RideWiseBackup, mode: RestoreMode): Promise<Bike | null> {
  const db = await getRideWiseDatabase();
  await db.withTransactionAsync(async () => {
    if (mode === 'replace') {
      await db.execAsync(`
        DELETE FROM fuel_logs;
        DELETE FROM transactions;
        DELETE FROM categories;
        DELETE FROM bikes;
        DELETE FROM settings;
      `);
      for (const row of backup.settings) await insertSettings(db, row);
      for (const row of backup.bikes) await insertBike(db, row);
      for (const row of backup.categories) await insertCategory(db, row);
      for (const row of backup.transactions) await insertTransaction(db, row);
      for (const row of backup.fuel_logs) await insertFuel(db, row);
      return;
    }

    await mergeSettings(db, backup.settings);
    await mergeBikes(db, backup.bikes);
    await mergeCategories(db, backup.categories);
    await mergeTransactions(db, backup.transactions);
    await mergeFuel(db, backup.fuel_logs);
  });

  await seedDefaultCategories(db);
  if (mode === 'replace') await clearLegacyBike();

  const active = await db.getFirstAsync<BikeRow>(
    `SELECT * FROM bikes WHERE is_active = 1 AND deleted_at IS NULL LIMIT 1`,
  );
  if (!active) return null;
  return { id: active.id, brand: active.brand, model: active.model, currentOdo: active.current_odo };
}

type Database = Awaited<ReturnType<typeof getRideWiseDatabase>>;

async function insertSettings(db: Database, row: SettingsRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO settings (id, name, currency, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.name, row.currency, row.created_at, row.updated_at, row.deleted_at],
  );
}

async function insertBike(db: Database, row: BikeRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO bikes (
       id, brand, model, variant, year, current_odo, photo_uri, is_active, created_at, updated_at, deleted_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.brand,
      row.model,
      row.variant,
      row.year,
      row.current_odo,
      row.photo_uri,
      row.is_active,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    ],
  );
}

async function insertCategory(db: Database, row: CategoryRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO categories (
       id, name, icon, type, is_default, sort_order, created_at, updated_at, deleted_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.name,
      row.icon,
      row.type,
      row.is_default,
      row.sort_order,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    ],
  );
}

async function insertTransaction(db: Database, row: TransactionRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO transactions (
       id, amount, category_id, bike_id, date, note, payment_method, created_at, updated_at, deleted_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.amount,
      row.category_id,
      row.bike_id,
      row.date,
      row.note,
      row.payment_method,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    ],
  );
}

async function insertFuel(db: Database, row: FuelLogRow): Promise<void> {
  await db.runAsync(
    `INSERT INTO fuel_logs (
       id, transaction_id, bike_id, odo, litres, price_per_litre, fuel_type, station, is_full_tank,
       created_at, updated_at, deleted_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.id,
      row.transaction_id,
      row.bike_id,
      row.odo,
      row.litres,
      row.price_per_litre,
      row.fuel_type,
      row.station,
      row.is_full_tank,
      row.created_at,
      row.updated_at,
      row.deleted_at,
    ],
  );
}

async function localTimes(db: Database, table: string): Promise<Map<string, number>> {
  const rows = await db.getAllAsync<{ id: string; updated_at: number }>(`SELECT id, updated_at FROM ${table}`);
  return new Map(rows.map((row) => [row.id, row.updated_at]));
}

async function mergeSettings(db: Database, rows: SettingsRow[]): Promise<void> {
  const local = await localTimes(db, 'settings');
  for (const row of rows) {
    const updated = local.get(row.id);
    if (updated == null) {
      await insertSettings(db, row);
    } else if (row.updated_at >= updated) {
      await db.runAsync(
        `UPDATE settings SET name = ?, currency = ?, created_at = ?, updated_at = ?, deleted_at = ? WHERE id = ?`,
        [row.name, row.currency, row.created_at, row.updated_at, row.deleted_at, row.id],
      );
    }
  }
}

async function mergeBikes(db: Database, rows: BikeRow[]): Promise<void> {
  const local = await localTimes(db, 'bikes');
  for (const row of rows) {
    const updated = local.get(row.id);
    if (updated != null && updated > row.updated_at) continue;
    if (row.is_active === 1 && row.deleted_at == null) {
      await db.runAsync(
        `UPDATE bikes SET is_active = 0 WHERE is_active = 1 AND deleted_at IS NULL AND id != ?`,
        [row.id],
      );
    }
    if (updated == null) {
      await insertBike(db, row);
    } else {
      await db.runAsync(
        `UPDATE bikes
         SET brand = ?, model = ?, variant = ?, year = ?, current_odo = ?, photo_uri = ?, is_active = ?,
             created_at = ?, updated_at = ?, deleted_at = ?
         WHERE id = ?`,
        [
          row.brand,
          row.model,
          row.variant,
          row.year,
          row.current_odo,
          row.photo_uri,
          row.is_active,
          row.created_at,
          row.updated_at,
          row.deleted_at,
          row.id,
        ],
      );
    }
  }
}

async function mergeCategories(db: Database, rows: CategoryRow[]): Promise<void> {
  const local = await localTimes(db, 'categories');
  for (const row of rows) {
    const updated = local.get(row.id);
    if (updated == null) {
      await insertCategory(db, row);
    } else if (row.updated_at >= updated) {
      await db.runAsync(
        `UPDATE categories
         SET name = ?, icon = ?, type = ?, is_default = ?, sort_order = ?, created_at = ?, updated_at = ?, deleted_at = ?
         WHERE id = ?`,
        [
          row.name,
          row.icon,
          row.type,
          row.is_default,
          row.sort_order,
          row.created_at,
          row.updated_at,
          row.deleted_at,
          row.id,
        ],
      );
    }
  }
}

async function mergeTransactions(db: Database, rows: TransactionRow[]): Promise<void> {
  const local = await localTimes(db, 'transactions');
  for (const row of rows) {
    const updated = local.get(row.id);
    if (updated == null) {
      await insertTransaction(db, row);
    } else if (row.updated_at >= updated) {
      await db.runAsync(
        `UPDATE transactions
         SET amount = ?, category_id = ?, bike_id = ?, date = ?, note = ?, payment_method = ?,
             created_at = ?, updated_at = ?, deleted_at = ?
         WHERE id = ?`,
        [
          row.amount,
          row.category_id,
          row.bike_id,
          row.date,
          row.note,
          row.payment_method,
          row.created_at,
          row.updated_at,
          row.deleted_at,
          row.id,
        ],
      );
    }
  }
}

async function mergeFuel(db: Database, rows: FuelLogRow[]): Promise<void> {
  const local = await localTimes(db, 'fuel_logs');
  for (const row of rows) {
    const updated = local.get(row.id);
    if (updated == null) {
      await insertFuel(db, row);
    } else if (row.updated_at >= updated) {
      await db.runAsync(
        `UPDATE fuel_logs
         SET transaction_id = ?, bike_id = ?, odo = ?, litres = ?, price_per_litre = ?, fuel_type = ?,
             station = ?, is_full_tank = ?, created_at = ?, updated_at = ?, deleted_at = ?
         WHERE id = ?`,
        [
          row.transaction_id,
          row.bike_id,
          row.odo,
          row.litres,
          row.price_per_litre,
          row.fuel_type,
          row.station,
          row.is_full_tank,
          row.created_at,
          row.updated_at,
          row.deleted_at,
          row.id,
        ],
      );
    }
  }
}
