import { FUEL_CATEGORY_ID } from '@/src/database/seed';
import { getRideWiseDatabase } from '@/src/database/sqlite';
import type { FuelCapture } from '@/src/features/fuel/calculate';
import { resolveFuel } from '@/src/features/fuel/calculate';
import { mileageFromFill, type Mileage } from '@/src/features/fuel/mileage';

import { getActiveBike, type Bike } from './bikeRepository';
import { blankToNull, createId, timestampNow } from './support';

export type NewFuelLog = {
  amount: number;
  date?: number;
  note?: string | null;
  paymentMethod?: string | null;
} & FuelCapture;

const PRIOR_FUEL_ODO = `
SELECT f.odo AS odo
FROM fuel_logs f
JOIN transactions t ON t.id = f.transaction_id
WHERE f.bike_id = ?
  AND f.deleted_at IS NULL
  AND t.deleted_at IS NULL
  AND f.odo < ?
ORDER BY f.odo DESC
LIMIT 1
`;

/** Latest saved fuel reading below this ODO. Null when this is the first fill. */
export async function priorFuelOdo(beforeOdo: number): Promise<number | null> {
  const bike = await getActiveBike();
  if (!bike) return null;
  const db = await getRideWiseDatabase();
  const row = await db.getFirstAsync<{ odo: number }>(PRIOR_FUEL_ODO, [bike.id, beforeOdo]);
  return row?.odo ?? null;
}

/** Mileage of the latest fill. Insufficient until a prior fill has a lower ODO and this fill has litres. */
export async function latestMileage(): Promise<Mileage> {
  const bike = await getActiveBike();
  if (!bike) return { kind: 'insufficient' };
  const db = await getRideWiseDatabase();
  const latest = await db.getFirstAsync<{ odo: number; litres: number | null }>(
    `SELECT f.odo AS odo, f.litres AS litres
     FROM fuel_logs f
     JOIN transactions t ON t.id = f.transaction_id
     WHERE f.bike_id = ?
       AND f.deleted_at IS NULL
       AND t.deleted_at IS NULL
     ORDER BY f.odo DESC, t.date DESC
     LIMIT 1`,
    [bike.id],
  );
  if (!latest) return { kind: 'insufficient' };
  const previous = await db.getFirstAsync<{ odo: number }>(PRIOR_FUEL_ODO, [bike.id, latest.odo]);
  return mileageFromFill({
    previousOdo: previous?.odo ?? null,
    odo: latest.odo,
    litres: latest.litres,
  });
}

function requireAmount(amount: number): number {
  const rounded = Math.round(amount * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
  return rounded;
}

/**
 * Saves fuel as one expense plus one fuel log, and moves the bike's ODO to this reading.
 * A lower ODO is stored only when the caller sets confirmLowerOdo.
 */
export async function addFuel(input: NewFuelLog): Promise<Bike> {
  const bike = await getActiveBike();
  if (!bike) {
    throw new Error('Add a bike before logging fuel.');
  }
  if (!Number.isFinite(input.odo) || input.odo < 0) {
    throw new Error('ODO must be zero or more.');
  }
  if (input.odo < bike.currentOdo && !input.confirmLowerOdo) {
    throw new Error('ODO is below the bike reading.');
  }

  const amount = requireAmount(input.amount);
  const resolved = resolveFuel({
    amount,
    litres: input.litres,
    pricePerLitre: input.pricePerLitre,
  });
  if (resolved.litres == null && resolved.pricePerLitre == null) {
    throw new Error('Add litres or a price per litre.');
  }
  if (input.pricePerLitre != null && input.litres == null && resolved.litres == null) {
    throw new Error('Those figures do not make a positive fill.');
  }
  if (input.litres != null && input.pricePerLitre == null && resolved.pricePerLitre == null) {
    throw new Error('Those figures do not make a positive fill.');
  }

  const db = await getRideWiseDatabase();
  const category = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL`,
    [FUEL_CATEGORY_ID],
  );
  if (!category) {
    throw new Error('Fuel category is missing.');
  }

  const now = timestampNow();
  const transactionId = createId();
  const fuelId = createId();
  const date = input.date ?? now;
  const note = blankToNull(input.note);
  const paymentMethod = blankToNull(input.paymentMethod);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO transactions (id, amount, category_id, bike_id, date, note, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, amount, FUEL_CATEGORY_ID, bike.id, date, note, paymentMethod, now, now],
    );
    await db.runAsync(
      `INSERT INTO fuel_logs (
         id, transaction_id, bike_id, odo, litres, price_per_litre, is_full_tank, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [fuelId, transactionId, bike.id, input.odo, resolved.litres, resolved.pricePerLitre, now, now],
    );
    const updated = await db.runAsync(
      `UPDATE bikes SET current_odo = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`,
      [input.odo, now, bike.id],
    );
    if (updated.changes !== 1) {
      throw new Error('Could not update the bike.');
    }
  });

  return { ...bike, currentOdo: input.odo };
}
