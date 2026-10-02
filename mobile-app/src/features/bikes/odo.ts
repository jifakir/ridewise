export function parseOdo(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const odo = Number(trimmed);
  if (!Number.isSafeInteger(odo) || odo < 0) return null;
  return odo;
}

export function formatOdo(km: number): string {
  return `${km.toLocaleString('en-US')} km`;
}
