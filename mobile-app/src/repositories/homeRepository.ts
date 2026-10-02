import type { Mileage } from '@/src/features/fuel/mileage';
import { monthBounds } from '@/src/utils/dates';

import { listExpenses, monthlyTotals, type ExpenseListItem } from './expenseRepository';
import { latestMileage } from './fuelRepository';

const RECENT_LIMIT = 5;

export type HomeSummary = {
  total: number;
  daily: number;
  bike: number;
  count: number;
  recent: ExpenseListItem[];
  mileage: Mileage;
};

/** This month's spend, the latest expenses, and mileage when the fuel history supports it. */
export async function getHomeSummary(): Promise<HomeSummary> {
  const { start, end } = monthBounds();
  const [totals, recent, mileage] = await Promise.all([
    monthlyTotals(start, end),
    listExpenses({ limit: RECENT_LIMIT }),
    latestMileage(),
  ]);
  return {
    total: totals.total,
    daily: totals.daily,
    bike: totals.bike,
    count: totals.count,
    recent,
    mileage,
  };
}
