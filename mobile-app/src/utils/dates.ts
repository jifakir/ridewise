export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function atLocalNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

export function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function asDate(input: Date | number): Date {
  return input instanceof Date ? input : new Date(input);
}

export function dayKey(input: Date | number): string {
  const date = startOfDay(asDate(input));
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Today, Yesterday, or a short calendar date such as 2 Oct 2026. */
export function dayLabel(input: Date | number, now = new Date()): string {
  const date = asDate(input);
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function shiftDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0, 0);
  return next.getTime() > endOfToday().getTime() ? atLocalNoon(new Date()) : next;
}
