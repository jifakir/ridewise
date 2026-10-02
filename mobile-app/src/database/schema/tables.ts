export const TABLE_NAMES = [
  'settings',
  'bikes',
  'categories',
  'transactions',
  'fuel_logs',
] as const;

export type TableName = (typeof TABLE_NAMES)[number];
