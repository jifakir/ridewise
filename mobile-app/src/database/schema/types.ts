/** SQLite stores booleans as 0 | 1. */
export type SqliteFlag = 0 | 1;

/** Unix time in milliseconds. */
export type SqliteTimestamp = number;

export type SettingsRow = {
  id: string;
  name: string | null;
  currency: string;
  created_at: SqliteTimestamp;
  updated_at: SqliteTimestamp;
  deleted_at: SqliteTimestamp | null;
};

export type BikeRow = {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  year: number | null;
  current_odo: number;
  photo_uri: string | null;
  is_active: SqliteFlag;
  created_at: SqliteTimestamp;
  updated_at: SqliteTimestamp;
  deleted_at: SqliteTimestamp | null;
};

export type CategoryType = 'general' | 'bike';

export type CategoryRow = {
  id: string;
  name: string;
  icon: string | null;
  type: CategoryType;
  is_default: SqliteFlag;
  sort_order: number;
  created_at: SqliteTimestamp;
  updated_at: SqliteTimestamp;
  deleted_at: SqliteTimestamp | null;
};

export type TransactionRow = {
  id: string;
  amount: number;
  category_id: string;
  bike_id: string | null;
  date: SqliteTimestamp;
  note: string | null;
  payment_method: string | null;
  created_at: SqliteTimestamp;
  updated_at: SqliteTimestamp;
  deleted_at: SqliteTimestamp | null;
};

export type FuelLogRow = {
  id: string;
  transaction_id: string;
  bike_id: string;
  odo: number;
  litres: number | null;
  price_per_litre: number | null;
  fuel_type: string | null;
  station: string | null;
  is_full_tank: SqliteFlag;
  created_at: SqliteTimestamp;
  updated_at: SqliteTimestamp;
  deleted_at: SqliteTimestamp | null;
};
