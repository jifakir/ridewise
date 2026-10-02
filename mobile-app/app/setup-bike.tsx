import { useRouter } from 'expo-router';
import { useState } from 'react';

import { BikeSetupScreen } from '@/src/components/bike/BikeSetupScreen';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';

export default function SetupBikeRoute() {
  const router = useRouter();
  const { saveBike } = useWelcomeGate();
  const [busy, setBusy] = useState(false);

  async function handleSave(bike: { brand: string; model: string; currentOdo: number }) {
    if (busy) return;
    setBusy(true);
    await saveBike(bike);
    router.replace('/(tabs)');
  }

  return <BikeSetupScreen busy={busy} onSave={handleSave} />;
}
