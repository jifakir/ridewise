export const INITIAL_SCHEMA_SQL = `
CREATE TABLE settings (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT,
  currency TEXT NOT NULL DEFAULT 'BDT',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE bikes (
  id TEXT PRIMARY KEY NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER,
  current_odo REAL NOT NULL DEFAULT 0 CHECK (current_odo >= 0),
  photo_uri TEXT,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE UNIQUE INDEX idx_bikes_one_active
  ON bikes (is_active)
  WHERE is_active = 1 AND deleted_at IS NULL;

CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL CHECK (type IN ('general', 'bike')),
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX idx_categories_type ON categories (type);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  category_id TEXT NOT NULL REFERENCES categories (id) ON DELETE RESTRICT,
  bike_id TEXT REFERENCES bikes (id) ON DELETE RESTRICT,
  date INTEGER NOT NULL,
  note TEXT,
  payment_method TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX idx_transactions_date ON transactions (date DESC);
CREATE INDEX idx_transactions_category_id ON transactions (category_id);
CREATE INDEX idx_transactions_bike_id ON transactions (bike_id);

CREATE TABLE fuel_logs (
  id TEXT PRIMARY KEY NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE REFERENCES transactions (id) ON DELETE CASCADE,
  bike_id TEXT NOT NULL REFERENCES bikes (id) ON DELETE RESTRICT,
  odo REAL NOT NULL CHECK (odo >= 0),
  litres REAL CHECK (litres IS NULL OR litres > 0),
  price_per_litre REAL CHECK (price_per_litre IS NULL OR price_per_litre > 0),
  fuel_type TEXT,
  station TEXT,
  is_full_tank INTEGER NOT NULL DEFAULT 0 CHECK (is_full_tank IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX idx_fuel_logs_bike_id ON fuel_logs (bike_id);
`;
