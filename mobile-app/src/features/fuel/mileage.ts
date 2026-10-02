/** km/L outside this band is shown as a warning, not as a trusted rate. */
const MIN_KM_PER_LITRE = 8;
const MAX_KM_PER_LITRE = 120;

export type Mileage =
  | { kind: 'ready'; kmPerLitre: number }
  | { kind: 'insufficient' }
  | { kind: 'abnormal' };

/**
 * Distance since the previous fill, divided by litres on this fill.
 * Missing history and a zero or backward distance stay uncalculated.
 */
export function mileageFromFill(input: {
  previousOdo: number | null;
  odo: number;
  litres: number | null;
}): Mileage {
  if (input.previousOdo == null || input.litres == null || input.litres <= 0) {
    return { kind: 'insufficient' };
  }
  const distance = input.odo - input.previousOdo;
  if (!(distance > 0)) return { kind: 'insufficient' };
  const raw = distance / input.litres;
  if (!Number.isFinite(raw) || raw <= 0) return { kind: 'insufficient' };
  const kmPerLitre = Math.round(raw * 10) / 10;
  if (kmPerLitre < MIN_KM_PER_LITRE || kmPerLitre > MAX_KM_PER_LITRE) {
    return { kind: 'abnormal' };
  }
  return { kind: 'ready', kmPerLitre };
}

export function formatMileage(kmPerLitre: number): string {
  return `${kmPerLitre.toFixed(1)} km/L`;
}
