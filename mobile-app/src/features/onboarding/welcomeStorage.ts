import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_COMPLETED_KEY = 'ridewise.onboarding.welcomeCompleted';

export async function getWelcomeCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(WELCOME_COMPLETED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function persistWelcomeCompleted(): Promise<void> {
  await AsyncStorage.setItem(WELCOME_COMPLETED_KEY, 'true');
}
