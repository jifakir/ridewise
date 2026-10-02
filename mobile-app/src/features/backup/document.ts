import type {
  BikeRow,
  CategoryRow,
  FuelLogRow,
  SettingsRow,
  TransactionRow,
} from '@/src/database/schema/types';

/** Bump this when the JSON shape changes. SQLite's schema version is stored separately. */
export const BACKUP_FORMAT = 1;

export const BACKUP_APP = 'ridewise';

export type RideWiseBackup = {
  app: typeof BACKUP_APP;
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: number;
  settings: SettingsRow[];
  bikes: BikeRow[];
  categories: CategoryRow[];
  transactions: TransactionRow[];
  fuel_logs: FuelLogRow[];
};

export function backupFileName(exportedAt: number): string {
  const date = new Date(exportedAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `ridewise-backup-${date.getFullYear()}-${month}-${day}.json`;
}

export function serializeBackup(backup: RideWiseBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}
