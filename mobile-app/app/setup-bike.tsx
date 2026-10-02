import { useRouter } from 'expo-router';
import { useState } from 'react';

import { BikeSetupScreen } from '@/src/components/bike/BikeSetupScreen';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { showToast } from '@/src/utils/toast';

export default function SetupBikeRoute() {
  const router = useRouter();
  const { saveBike } = useWelcomeGate();
  const [busy, setBusy] = useState(false);

  async function handleSave(bike: { brand: string; model: string; currentOdo: number }) {
    if (busy) return;
    setBusy(true);
    try {
      await saveBike(bike);
      showToast('Bike saved');
      router.replace('/(tabs)');
    } catch {
      showToast('Could not save this bike. Try again.', 'long');
    } finally {
      setBusy(false);
    }
  }

  return <BikeSetupScreen busy={busy} onSave={handleSave} />;
}
