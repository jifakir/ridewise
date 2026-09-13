import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { useWelcomeGate, WelcomeGateProvider } from '@/src/features/onboarding/useWelcomeGate';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { ready, welcomeCompleted } = useWelcomeGate();

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!welcomeCompleted}>
          <Stack.Screen name="welcome" />
        </Stack.Protected>
        <Stack.Protected guard={welcomeCompleted}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <WelcomeGateProvider>
      <RootNavigator />
    </WelcomeGateProvider>
  );
}
