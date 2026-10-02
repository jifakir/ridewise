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

import { getActiveBike, persistActiveBike, type StoredBike } from '@/src/features/bikes/bikeStorage';

import { getWelcomeCompleted, persistWelcomeCompleted } from './welcomeStorage';

type WelcomeGateValue = {
  ready: boolean;
  welcomeCompleted: boolean;
  bike: StoredBike | null;
  completeWelcome: () => Promise<void>;
  saveBike: (bike: StoredBike) => Promise<void>;
};

const WelcomeGateContext = createContext<WelcomeGateValue | null>(null);

export function WelcomeGateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);
  const [bike, setBike] = useState<StoredBike | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getWelcomeCompleted(), getActiveBike()]).then(([done, activeBike]) => {
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

  const saveBike = useCallback(async (nextBike: StoredBike) => {
    try {
      await persistActiveBike(nextBike);
    } finally {
      setBike(nextBike);
    }
  }, []);

  const value = useMemo(
    () => ({ ready, welcomeCompleted, bike, completeWelcome, saveBike }),
    [ready, welcomeCompleted, bike, completeWelcome, saveBike],
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
