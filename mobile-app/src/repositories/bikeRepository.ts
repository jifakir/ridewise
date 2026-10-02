import type { BikeRow } from '@/src/database/schema/types';
import { getRideWiseDatabase } from '@/src/database/sqlite';
import { getActiveBike as readLegacyBike } from '@/src/features/bikes/bikeStorage';

import { createId, timestampNow } from './support';

export type BikeInput = {
  brand: string;
  model: string;
  currentOdo: number;
};

export type Bike = BikeInput & {
  id: string;
};

const ACTIVE_BIKE = `SELECT * FROM bikes WHERE is_active = 1 AND deleted_at IS NULL LIMIT 1`;

function toBike(row: BikeRow): Bike {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    currentOdo: row.current_odo,
  };
}

function requireBike(input: BikeInput): BikeInput {
  const brand = input.brand.trim();
  const model = input.model.trim();
  if (!brand || !model) {
    throw new Error('Brand and model are required.');
  }
  if (!Number.isFinite(input.currentOdo) || input.currentOdo < 0) {
    throw new Error('ODO must be zero or more.');
  }
  return { brand, model, currentOdo: input.currentOdo };
}

export async function getActiveBike(): Promise<Bike | null> {
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<BikeRow>(ACTIVE_BIKE);
  if (row) return toBike(row);

  const legacy = await readLegacyBike();
  if (!legacy) return null;
  return insertActiveBike(legacy);
}

export async function saveActiveBike(input: BikeInput): Promise<Bike> {
  const bike = requireBike(input);
  const db = await getRideWiseDatabase();
  const current = await db.getFirstAsync<BikeRow>(ACTIVE_BIKE);
  const now = timestampNow();

  if (!current) {
    return insertActiveBike(bike);
  }

  await db.runAsync(
    `UPDATE bikes SET brand = ?, model = ?, current_odo = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
    [bike.brand, bike.model, bike.currentOdo, now, current.id],
  );

  return { id: current.id, ...bike };
}

async function insertActiveBike(input: BikeInput): Promise<Bike> {
  const bike = requireBike(input);
  const db = await getRideWiseDatabase();
  const now = timestampNow();
  const id = createId();

  await db.runAsync(
    `INSERT INTO bikes (id, brand, model, current_odo, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
    [id, bike.brand, bike.model, bike.currentOdo, now, now],
  );

  return { id, ...bike };
}
