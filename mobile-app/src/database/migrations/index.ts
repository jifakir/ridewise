import { INITIAL_SCHEMA_SQL } from './001_initial';

export type Migration = {
  version: number;
  sql: string;
};

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: INITIAL_SCHEMA_SQL,
  },
];
