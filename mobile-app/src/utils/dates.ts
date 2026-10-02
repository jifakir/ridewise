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

/** Local start of this month, and the local start of the next month. */
export function monthBounds(now = new Date()): { start: number; end: number } {
  const start = startOfMonth(now).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return { start, end };
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Moves by whole months and never lands after the current month. */
export function shiftMonths(date: Date, delta: number, now = new Date()): Date {
  const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
  const cap = startOfMonth(now);
  return next.getTime() > cap.getTime() ? cap : next;
}

/** `count` months ending at `end`, oldest first. */
export function recentMonths(end: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    return new Date(end.getFullYear(), end.getMonth() - offset, 1);
  });
}

export function monthName(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

export function monthTitle(date: Date): string {
  return `${monthName(date)} ${date.getFullYear()}`;
}

export function monthShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function shiftDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0, 0);
  return next.getTime() > endOfToday().getTime() ? atLocalNoon(new Date()) : next;
}
