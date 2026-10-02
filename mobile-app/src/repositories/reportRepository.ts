import { FUEL_CATEGORY_ID } from '@/src/database/seed';
import type { CategoryType } from '@/src/database/schema/types';
import { getRideWiseDatabase } from '@/src/database/sqlite';
import { monthBounds, monthShort, recentMonths } from '@/src/utils/dates';

import { monthlyTotals, type MonthlyTotals } from './expenseRepository';

const TREND_MONTHS = 6;

export type CategorySpend = {
  id: string;
  name: string;
  icon: string | null;
  type: CategoryType;
  total: number;
};

export type MonthReport = MonthlyTotals & {
  categories: CategorySpend[];
  fuel: number;
};

export type TrendPoint = {
  start: number;
  label: string;
  total: number;
};

function roundTaka(amount: number): number {
  return Math.round(amount * 100) / 100;
}

async function categoryTotals(start: number, end: number): Promise<CategorySpend[]> {
  const db = await getRideWiseDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    icon: string | null;
    type: CategoryType;
    total: number;
  }>(
    `SELECT c.id AS id, c.name AS name, c.icon AS icon, c.type AS type, SUM(t.amount) AS total
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     WHERE t.deleted_at IS NULL
       AND t.date >= ?
       AND t.date < ?
     GROUP BY c.id
     HAVING SUM(t.amount) > 0
     ORDER BY total DESC, c.sort_order ASC`,
    [start, end],
  );
  return rows.map((row) => ({ ...row, total: roundTaka(row.total) }));
}

/** Totals, category breakdown, and fuel spend for one month. */
export async function getMonthReport(start: number, end: number): Promise<MonthReport> {
  const [totals, categories] = await Promise.all([monthlyTotals(start, end), categoryTotals(start, end)]);
  const fuel = categories.find((category) => category.id === FUEL_CATEGORY_ID)?.total ?? 0;
  return { ...totals, categories, fuel };
}

/** Six months ending at `endMonth`, oldest first. */
export async function getMonthlyTrend(endMonth: Date): Promise<TrendPoint[]> {
  const months = recentMonths(endMonth, TREND_MONTHS);
  return Promise.all(
    months.map(async (month) => {
      const { start, end } = monthBounds(month);
      const totals = await monthlyTotals(start, end);
      return { start, label: monthShort(month), total: totals.total };
    }),
  );
}
