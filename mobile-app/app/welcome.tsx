import { useRouter } from 'expo-router';
import { useState } from 'react';

import { WelcomeScreen } from '@/src/components/welcome/WelcomeScreen';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';

export default function WelcomeRoute() {
  const router = useRouter();
  const { completeWelcome } = useWelcomeGate();
  const [busy, setBusy] = useState(false);

  async function handleGetStarted() {
    if (busy) return;
    setBusy(true);
    await completeWelcome();
    router.replace('/(tabs)');
  }

  return <WelcomeScreen busy={busy} onGetStarted={handleGetStarted} />;
}
