/** BDT display until a currency setting exists. Whole taka stay whole. */
export function formatBdt(amount: number): string {
  const negative = amount < 0;
  const [whole, fraction] = Math.abs(amount).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = fraction === '00' ? grouped : `${grouped}.${fraction}`;
  return `${negative ? '-' : ''}৳${body}`;
}

/** Keep a single decimal point and at most two fraction digits while typing. */
export function sanitizeAmountInput(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const fraction = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return `${whole}.${fraction}`;
}

/** Digits for the amount field. Whole taka stay whole. */
export function amountInputValue(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0$/, '');
}

/** Null when the text is empty, partial, or not a positive taka amount. */
export function parseAmount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const amount = Math.round(Number(trimmed) * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}
