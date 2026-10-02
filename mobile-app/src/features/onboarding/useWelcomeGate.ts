import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { openRideWiseDatabase } from '@/src/database/sqlite';
import { getActiveBike, saveActiveBike, type Bike, type BikeInput } from '@/src/repositories/bikeRepository';

import { getWelcomeCompleted, persistWelcomeCompleted } from './welcomeStorage';

type WelcomeGateValue = {
  ready: boolean;
  welcomeCompleted: boolean;
  bike: Bike | null;
  completeWelcome: () => Promise<void>;
  saveBike: (bike: BikeInput) => Promise<void>;
  noteBike: (bike: Bike | null) => void;
};

const WelcomeGateContext = createContext<WelcomeGateValue | null>(null);

export function WelcomeGateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [bike, setBike] = useState<Bike | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      openRideWiseDatabase().catch((error: unknown) => {
        console.error('RideWise database failed to open', error);
      }),
      getWelcomeCompleted(),
      getActiveBike().catch((error: unknown) => {
        console.error('RideWise bike failed to load', error);
        return null;
      }),
    ]).then(([, done, activeBike]) => {
      if (cancelled) return;
      setWelcomeCompleted(done);
      setBike(activeBike);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const completeWelcome = useCallback(async () => {
    try {
      await persistWelcomeCompleted();
    } finally {
      setWelcomeCompleted(true);
    }
  }, []);

  const saveBike = useCallback(async (nextBike: BikeInput) => {
    const saved = await saveActiveBike(nextBike);
    setBike(saved);
  }, []);

  const noteBike = useCallback((nextBike: Bike | null) => {
    setBike(nextBike);
  }, []);

  const value = useMemo(
    () => ({ ready, welcomeCompleted, bike, completeWelcome, saveBike, noteBike }),
    [ready, welcomeCompleted, bike, completeWelcome, saveBike, noteBike],
  );

  return createElement(WelcomeGateContext.Provider, { value }, children);
}

export function useWelcomeGate() {
  const value = useContext(WelcomeGateContext);
  if (!value) {
    throw new Error('useWelcomeGate must be used within WelcomeGateProvider');
  }
  return value;
}
