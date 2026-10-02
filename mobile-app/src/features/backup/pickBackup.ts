import { File } from 'expo-file-system';
import { Platform } from 'react-native';

/** Null when the user closes the picker without choosing a file. */
export async function pickBackupText(): Promise<string | null> {
  if (Platform.OS === 'web') return pickWebBackup();
  const picked = await File.pickFileAsync();
  if (picked.canceled) return null;
  return picked.result.text();
}

function pickWebBackup(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        finish(null);
        return;
      }
      void file.text().then(finish).catch(() => finish(null));
    };
    window.addEventListener(
      'focus',
      () => {
        setTimeout(() => finish(null), 400);
      },
      { once: true },
    );
    input.click();
  });
}
