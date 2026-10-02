import { Platform, ToastAndroid } from 'react-native';

/** Short confirms an action. Long is for a failure the user may need to read. */
export type ToastLength = 'short' | 'long';

/**
 * Action feedback for the whole app.
 * Android uses ToastAndroid. Swap this body for a cross-platform toast package when iOS needs the same message.
 */
export function showToast(message: string, length: ToastLength = 'short'): void {
  if (Platform.OS !== 'android') return;
  ToastAndroid.show(message, length === 'long' ? ToastAndroid.LONG : ToastAndroid.SHORT);
}
