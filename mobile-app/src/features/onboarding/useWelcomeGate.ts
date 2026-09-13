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

import { getWelcomeCompleted, persistWelcomeCompleted } from './welcomeStorage';

type WelcomeGateValue = {
  ready: boolean;
  welcomeCompleted: boolean;
  completeWelcome: () => Promise<void>;
};

const WelcomeGateContext = createContext<WelcomeGateValue | null>(null);

export function WelcomeGateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [welcomeCompleted, setWelcomeCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getWelcomeCompleted().then((done) => {
      if (cancelled) return;
      setWelcomeCompleted(done);
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

  const value = useMemo(
    () => ({ ready, welcomeCompleted, completeWelcome }),
    [ready, welcomeCompleted, completeWelcome],
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
