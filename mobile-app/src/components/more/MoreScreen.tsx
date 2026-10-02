import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatOdo } from '@/src/features/bikes/odo';
import { backupFileName, serializeBackup } from '@/src/features/backup/document';
import { pickBackupText } from '@/src/features/backup/pickBackup';
import { parseBackup } from '@/src/features/backup/parseBackup';
import type { RideWiseBackup } from '@/src/features/backup/document';
import { shareBackup } from '@/src/features/backup/shareBackup';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { exportBackup, restoreBackup, type RestoreMode } from '@/src/repositories/backupRepository';
import { colors } from '@/src/theme/colors';
import { showToast } from '@/src/utils/toast';

export function MoreScreen() {
  const router = useRouter();
  const { bike, noteBike } = useWelcomeGate();
  const [action, setAction] = useState<'export' | 'restore' | null>(null);
  const busy = action !== null;

  async function handleExport() {
    if (busy) return;
    setAction('export');
    try {
      const backup = await exportBackup();
      await shareBackup(serializeBackup(backup), backupFileName(backup.exportedAt));
      showToast('Backup ready');
    } catch {
      showToast('Could not export the backup. Try again.', 'long');
    } finally {
      setAction(null);
    }
  }

  async function handleRestore() {
    if (busy) return;
    setAction('restore');
    try {
      const text = await pickBackupText();
      if (!text) return;
      const parsed = parseBackup(text);
      if (!parsed.ok) {
        showToast(parsed.message, 'long');
        return;
      }
      const backup = parsed.backup;
      setAction(null);
      Alert.alert(
        'Restore this backup?',
        'Replace removes the expenses, fuel, and bike on this phone, then loads the file. Merge keeps both, and the newer copy wins when a record is in both.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Merge', onPress: () => void applyRestore(backup, 'merge') },
          { text: 'Replace', style: 'destructive', onPress: () => void applyRestore(backup, 'replace') },
        ],
      );
    } catch {
      showToast('Could not open that file. Try again.', 'long');
    } finally {
      setAction(null);
    }
  }

  async function applyRestore(backup: RideWiseBackup, mode: RestoreMode) {
    setAction('restore');
    let leaving = false;
    try {
      const active = await restoreBackup(backup, mode);
      showToast(mode === 'replace' ? 'Backup replaced' : 'Backup merged');
      if (!active) {
        leaving = true;
        noteBike(null);
        return;
      }
      noteBike(active);
    } catch {
      showToast('Could not restore this backup. Try again.', 'long');
    } finally {
      if (!leaving) setAction(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-2xl font-bold text-foreground">More</Text>
          <Text className="mt-1 text-sm text-muted">Your motorbike on this phone.</Text>
        </View>

        <View className="gap-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={bike ? `My Bike, ${bike.brand} ${bike.model}` : 'My Bike'}
            onPress={() => router.push('/bike')}
            className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text className="text-xs text-muted">My Bike</Text>
              <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
                {bike ? `${bike.brand} ${bike.model}` : 'No motorbike yet'}
              </Text>
              {bike ? (
                <Text className="mt-0.5 text-sm text-muted">ODO {formatOdo(bike.currentOdo)}</Text>
              ) : null}
            </View>
            <Text className="text-sm font-semibold text-primary">{bike ? 'Change' : 'Add'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export backup"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => {
              void handleExport();
            }}
            className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Ionicons name="download-outline" size={20} color={colors.primary} />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text className="text-xs text-muted">Backup</Text>
              <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
                Export backup
              </Text>
              <Text className="mt-0.5 text-sm text-muted">Expenses, fuel, and your bike. Nothing is uploaded.</Text>
            </View>
            <Text className="text-sm font-semibold text-primary">{action === 'export' ? 'Exporting…' : 'Export'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restore backup"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={() => {
              void handleRestore();
            }}
            className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Ionicons name="folder-open-outline" size={20} color={colors.primary} />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text className="text-xs text-muted">Backup</Text>
              <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
                Restore backup
              </Text>
              <Text className="mt-0.5 text-sm text-muted">Choose a file, then replace or merge.</Text>
            </View>
            <Text className="text-sm font-semibold text-primary">{action === 'restore' ? 'Restoring…' : 'Restore'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
