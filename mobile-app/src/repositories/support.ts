import * as Crypto from 'expo-crypto';

import type { SqliteFlag, SqliteTimestamp } from '@/src/database/schema/types';

/** Globally unique id so rows stay mergeable if cloud sync is added later. */
export function createId(): string {
  return Crypto.randomUUID();
}

export function timestampNow(): SqliteTimestamp {
  return Date.now();
}

export function toFlag(value: boolean): SqliteFlag {
  return value ? 1 : 0;
}

export function fromFlag(value: SqliteFlag): boolean {
  return value === 1;
}
