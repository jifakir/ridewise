import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_BIKE_KEY = 'ridewise.bike.active';

export type StoredBike = {
  brand: string;
  model: string;
  currentOdo: number;
};

function isStoredBike(value: unknown): value is StoredBike {
  if (!value || typeof value !== 'object') return false;
  const bike = value as StoredBike;
  return (
    typeof bike.brand === 'string' &&
    typeof bike.model === 'string' &&
    typeof bike.currentOdo === 'number' &&
    Number.isFinite(bike.currentOdo) &&
    bike.currentOdo >= 0
  );
}

export async function getActiveBike(): Promise<StoredBike | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_BIKE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredBike(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function persistActiveBike(bike: StoredBike): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_BIKE_KEY, JSON.stringify(bike));
}

export async function clearLegacyBike(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_BIKE_KEY);
}
