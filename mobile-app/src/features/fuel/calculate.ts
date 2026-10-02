import { formatOdo, parseOdo } from '@/src/features/bikes/odo';
import { formatBdt, parseAmount, sanitizeDecimalInput } from '@/src/utils/money';

export type FuelCapture = {
  odo: number;
  litres: number | null;
  pricePerLitre: number | null;
  confirmLowerOdo: boolean;
};

export type FuelResolution = {
  litres: number | null;
  pricePerLitre: number | null;
  mismatch: boolean;
  abnormal: string | null;
};

const MISMATCH_TAKA = 1;
const MIN_PRICE = 50;
const MAX_PRICE = 250;
const MAX_LITRES = 25;
const LONG_TRIP_KM = 5000;

export function sanitizeVolumeInput(value: string): string {
  return sanitizeDecimalInput(value, 3);
}

export function parseVolume(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) return null;
  const volume = Math.round(Number(trimmed) * 1000) / 1000;
  if (!Number.isFinite(volume) || volume <= 0) return null;
  return volume;
}

export function formatLitres(litres: number): string {
  const text = litres.toFixed(3).replace(/\.?0+$/, '');
  return `${text} L`;
}

function roundMoney(value: number): number | null {
  const rounded = Math.round(value * 100) / 100;
  if (!Number.isFinite(rounded) || rounded <= 0) return null;
  return rounded;
}

function roundVolume(value: number): number | null {
  const rounded = Math.round(value * 1000) / 1000;
  if (!Number.isFinite(rounded) || rounded <= 0) return null;
  return rounded;
}

/** Fills the missing litres or price. Leaves both values alone when the user typed both. */
export function resolveFuel(input: {
  amount: number;
  litres: number | null;
  pricePerLitre: number | null;
}): FuelResolution {
  const hasLitres = input.litres != null && input.litres > 0;
  const hasPrice = input.pricePerLitre != null && input.pricePerLitre > 0;

  let litres = hasLitres ? input.litres : null;
  let pricePerLitre = hasPrice ? input.pricePerLitre : null;

  if (input.amount > 0 && hasPrice && !hasLitres && input.pricePerLitre != null) {
    litres = roundVolume(input.amount / input.pricePerLitre);
  } else if (input.amount > 0 && hasLitres && !hasPrice && input.litres != null) {
    pricePerLitre = roundMoney(input.amount / input.litres);
  }

  const mismatch =
    hasLitres &&
    hasPrice &&
    input.amount > 0 &&
    input.litres != null &&
    input.pricePerLitre != null &&
    Math.abs(input.litres * input.pricePerLitre - input.amount) > MISMATCH_TAKA;

  let abnormal: string | null = null;
  if (pricePerLitre != null && (pricePerLitre < MIN_PRICE || pricePerLitre > MAX_PRICE)) {
    abnormal = 'That price per litre looks unusual.';
  } else if (litres != null && litres > MAX_LITRES) {
    abnormal = 'That is a lot of litres for one fill.';
  }

  return { litres, pricePerLitre, mismatch, abnormal };
}

export type FuelNotice = {
  tone: 'muted' | 'warning' | 'danger';
  text: string;
};

export type FuelEntryState = {
  canSave: boolean;
  notice: FuelNotice | null;
  needsLowerConfirm: boolean;
  capture: FuelCapture | null;
};

export function fuelEntryState(input: {
  amount: number | null;
  litresText: string;
  priceText: string;
  odoText: string;
  activeOdo: number | null;
  allowLowerOdo: boolean;
}): FuelEntryState {
  const blocked: FuelEntryState = {
    canSave: false,
    notice: null,
    needsLowerConfirm: false,
    capture: null,
  };
  if (input.amount == null) return blocked;

  if (input.activeOdo == null) {
    return { ...blocked, notice: { tone: 'danger', text: 'Add a bike before logging fuel.' } };
  }

  const litresPartial = input.litresText.endsWith('.');
  const pricePartial = input.priceText.endsWith('.');
  const parsedLitres = parseVolume(input.litresText);
  const parsedPrice = parseAmount(input.priceText);
  const litresInvalid = input.litresText.length > 0 && !litresPartial && parsedLitres === null;
  const priceInvalid = input.priceText.length > 0 && !pricePartial && parsedPrice === null;

  if (litresInvalid) {
    return { ...blocked, notice: { tone: 'danger', text: 'Enter litres greater than zero.' } };
  }
  if (priceInvalid) {
    return { ...blocked, notice: { tone: 'danger', text: 'Enter a price per litre greater than zero.' } };
  }
  if (litresPartial || pricePartial) {
    return { ...blocked, notice: { tone: 'muted', text: 'Finish the number.' } };
  }
  if (parsedLitres === null && parsedPrice === null) {
    return { ...blocked, notice: { tone: 'muted', text: 'Add litres or a price per litre.' } };
  }

  const odo = parseOdo(input.odoText);
  if (odo === null) {
    return { ...blocked, notice: { tone: 'muted', text: 'Add the current ODO.' } };
  }

  const tooLow = odo < input.activeOdo;
  if (tooLow && !input.allowLowerOdo) {
    return {
      ...blocked,
      needsLowerConfirm: true,
      notice: { tone: 'danger', text: `This is below ${formatOdo(input.activeOdo)}.` },
    };
  }

  const resolved = resolveFuel({
    amount: input.amount,
    litres: parsedLitres,
    pricePerLitre: parsedPrice,
  });
  const missingLitres = parsedPrice !== null && parsedLitres === null && resolved.litres === null;
  const missingPrice = parsedLitres !== null && parsedPrice === null && resolved.pricePerLitre === null;
  if (missingLitres || missingPrice || (resolved.litres === null && resolved.pricePerLitre === null)) {
    return { ...blocked, notice: { tone: 'danger', text: "Those figures don't make a positive fill." } };
  }

  let notice: FuelNotice | null = null;
  if (resolved.mismatch) {
    notice = { tone: 'warning', text: "Amount, litres, and price per litre don't match." };
  } else if (resolved.abnormal) {
    notice = { tone: 'warning', text: resolved.abnormal };
  } else if (odo - input.activeOdo > LONG_TRIP_KM) {
    notice = { tone: 'warning', text: `That is a long way since ${formatOdo(input.activeOdo)}.` };
  } else if (parsedLitres === null && resolved.litres !== null) {
    notice = { tone: 'muted', text: `Litres will be ${formatLitres(resolved.litres)}.` };
  } else if (parsedPrice === null && resolved.pricePerLitre !== null) {
    notice = { tone: 'muted', text: `Price per litre will be ${formatBdt(resolved.pricePerLitre)}.` };
  }

  return {
    canSave: true,
    notice,
    needsLowerConfirm: false,
    capture: {
      odo,
      litres: parsedLitres,
      pricePerLitre: parsedPrice,
      confirmLowerOdo: tooLow,
    },
  };
}
