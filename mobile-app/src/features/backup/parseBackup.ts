import { SCHEMA_VERSION } from '@/src/database/migrate';
import type {
  BikeRow,
  CategoryRow,
  FuelLogRow,
  SettingsRow,
  TransactionRow,
} from '@/src/database/schema/types';

import { BACKUP_APP, BACKUP_FORMAT, type RideWiseBackup } from './document';

const NOT_BACKUP = "This file isn't a RideWise backup.";
const BAD_FORMAT = "This backup uses a format this app can't read.";
const TOO_NEW = 'This backup is from a newer RideWise.';
const DAMAGED = "This backup is damaged and can't be restored.";

export type BackupParseResult = { ok: true; backup: RideWiseBackup } | { ok: false; message: string };

export function parseBackup(raw: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch {
    return { ok: false, message: NOT_BACKUP };
  }
  if (!isRecord(parsed)) return { ok: false, message: NOT_BACKUP };
  if (parsed.app !== BACKUP_APP) return { ok: false, message: NOT_BACKUP };
  if (parsed.format !== BACKUP_FORMAT) return { ok: false, message: BAD_FORMAT };
  if (!isSchemaVersion(parsed.schemaVersion)) {
    return { ok: false, message: typeof parsed.schemaVersion === 'number' && parsed.schemaVersion > SCHEMA_VERSION ? TOO_NEW : NOT_BACKUP };
  }
  if (typeof parsed.exportedAt !== 'number' || !Number.isFinite(parsed.exportedAt)) {
    return { ok: false, message: NOT_BACKUP };
  }

  const settings = parseSettings(parsed.settings);
  const bikes = parseBikes(parsed.bikes);
  const categories = parseCategories(parsed.categories);
  if (!settings.ok || !bikes.ok || !categories.ok) return { ok: false, message: DAMAGED };
  const transactions = parseTransactions(parsed.transactions, categories.ids, bikes.ids);
  if (!transactions.ok) return { ok: false, message: DAMAGED };
  const fuelLogs = parseFuelLogs(parsed.fuel_logs, transactions.ids, bikes.ids);
  if (!fuelLogs.ok) return { ok: false, message: DAMAGED };

  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      format: BACKUP_FORMAT,
      schemaVersion: parsed.schemaVersion,
      exportedAt: parsed.exportedAt,
      settings: settings.rows,
      bikes: bikes.rows,
      categories: categories.rows,
      transactions: transactions.rows,
      fuel_logs: fuelLogs.rows,
    },
  };
}

function isSchemaVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= SCHEMA_VERSION;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isText(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isStamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNullableStamp(value: unknown): value is number | null {
  return value === null || isStamp(value);
}

function isFlag(value: unknown): value is 0 | 1 {
  return value === 0 || value === 1;
}

function hasStamps(row: Record<string, unknown>): row is Record<string, unknown> & {
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
} {
  return isStamp(row.created_at) && isStamp(row.updated_at) && isNullableStamp(row.deleted_at);
}

type Rows<T> = { ok: true; rows: T[]; ids: Set<string> } | { ok: false; rows?: undefined; ids?: undefined };

function parseSettings(value: unknown): Rows<SettingsRow> {
  if (!Array.isArray(value)) return { ok: false };
  const rows: SettingsRow[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id)) return { ok: false };
    if (!isText(item.name) || typeof item.currency !== 'string' || !hasStamps(item)) return { ok: false };
    ids.add(item.id);
    rows.push({
      id: item.id,
      name: item.name,
      currency: item.currency,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    });
  }
  return { ok: true, rows, ids };
}

function parseBikes(value: unknown): Rows<BikeRow> {
  if (!Array.isArray(value)) return { ok: false };
  const rows: BikeRow[] = [];
  const ids = new Set<string>();
  let active = 0;
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id)) return { ok: false };
    if (!isId(item.brand) || !isId(item.model) || !isText(item.variant) || !isText(item.photo_uri)) return { ok: false };
    if (!(item.year === null || isStamp(item.year))) return { ok: false };
    if (typeof item.current_odo !== 'number' || item.current_odo < 0 || !isFlag(item.is_active) || !hasStamps(item)) {
      return { ok: false };
    }
    if (item.is_active === 1 && item.deleted_at == null) active += 1;
    ids.add(item.id);
    rows.push({
      id: item.id,
      brand: item.brand,
      model: item.model,
      variant: item.variant,
      year: item.year,
      current_odo: item.current_odo,
      photo_uri: item.photo_uri,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    });
  }
  if (active > 1) return { ok: false };
  return { ok: true, rows, ids };
}

function parseCategories(value: unknown): Rows<CategoryRow> {
  if (!Array.isArray(value)) return { ok: false };
  const rows: CategoryRow[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id) || !isId(item.name)) return { ok: false };
    if (!isText(item.icon) || (item.type !== 'general' && item.type !== 'bike')) return { ok: false };
    if (!isFlag(item.is_default) || typeof item.sort_order !== 'number' || !hasStamps(item)) return { ok: false };
    ids.add(item.id);
    rows.push({
      id: item.id,
      name: item.name,
      icon: item.icon,
      type: item.type,
      is_default: item.is_default,
      sort_order: item.sort_order,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    });
  }
  return { ok: true, rows, ids };
}

function parseTransactions(value: unknown, categoryIds: Set<string>, bikeIds: Set<string>): Rows<TransactionRow> {
  if (!Array.isArray(value)) return { ok: false };
  const rows: TransactionRow[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id)) return { ok: false };
    if (typeof item.amount !== 'number' || !(item.amount > 0) || !isId(item.category_id)) return { ok: false };
    if (!categoryIds.has(item.category_id)) return { ok: false };
    if (!(item.bike_id === null || (isId(item.bike_id) && bikeIds.has(item.bike_id)))) return { ok: false };
    if (!isStamp(item.date) || !isText(item.note) || !isText(item.payment_method) || !hasStamps(item)) return { ok: false };
    ids.add(item.id);
    rows.push({
      id: item.id,
      amount: item.amount,
      category_id: item.category_id,
      bike_id: item.bike_id,
      date: item.date,
      note: item.note,
      payment_method: item.payment_method,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    });
  }
  return { ok: true, rows, ids };
}

function parseFuelLogs(value: unknown, transactionIds: Set<string>, bikeIds: Set<string>): Rows<FuelLogRow> {
  if (!Array.isArray(value)) return { ok: false };
  const rows: FuelLogRow[] = [];
  const ids = new Set<string>();
  const transactions = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id)) return { ok: false };
    if (!isId(item.transaction_id) || !transactionIds.has(item.transaction_id) || transactions.has(item.transaction_id)) {
      return { ok: false };
    }
    if (!isId(item.bike_id) || !bikeIds.has(item.bike_id)) return { ok: false };
    if (typeof item.odo !== 'number' || item.odo < 0) return { ok: false };
    if (!(item.litres === null || (typeof item.litres === 'number' && item.litres > 0))) return { ok: false };
    if (!(item.price_per_litre === null || (typeof item.price_per_litre === 'number' && item.price_per_litre > 0))) {
      return { ok: false };
    }
    if (!isText(item.fuel_type) || !isText(item.station) || !isFlag(item.is_full_tank) || !hasStamps(item)) return { ok: false };
    ids.add(item.id);
    transactions.add(item.transaction_id);
    rows.push({
      id: item.id,
      transaction_id: item.transaction_id,
      bike_id: item.bike_id,
      odo: item.odo,
      litres: item.litres,
      price_per_litre: item.price_per_litre,
      fuel_type: item.fuel_type,
      station: item.station,
      is_full_tank: item.is_full_tank,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    });
  }
  return { ok: true, rows, ids };
}
