import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NameField } from '@/src/components/bike/NameField';
import { OdoField } from '@/src/components/bike/OdoField';
import { MileageLine } from '@/src/components/fuel/MileageLine';
import { BackButton } from '@/src/components/navigation/BackButton';
import { formatOdo, parseOdo } from '@/src/features/bikes/odo';
import type { Mileage } from '@/src/features/fuel/mileage';
import { useWelcomeGate } from '@/src/features/onboarding/useWelcomeGate';
import { latestMileage } from '@/src/repositories/fuelRepository';
import { colors } from '@/src/theme/colors';

export function BikeProfileScreen() {
  const router = useRouter();
  const { bike, saveBike } = useWelcomeGate();
  const [brand, setBrand] = useState(bike?.brand ?? '');
  const [model, setModel] = useState(bike?.model ?? '');
  const [odo, setOdo] = useState(bike ? String(bike.currentOdo) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mileage, setMileage] = useState<Mileage | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      latestMileage()
        .then((result) => {
          if (!cancelled) setMileage(result);
        })
        .catch(() => {
          if (!cancelled) setMileage(null);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const currentOdo = parseOdo(odo);
  const canSave = brand.trim().length > 0 && model.trim().length > 0 && currentOdo !== null && !saving;

  async function handleSave() {
    if (!canSave || currentOdo === null) return;
    setSaving(true);
    setError(null);
    try {
      await saveBike({ brand: brand.trim(), model: model.trim(), currentOdo });
      router.back();
    } catch {
      setError('Could not save this bike. Try again.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5 flex-row items-center">
          <View className="mr-3">
            <BackButton onPress={() => router.back()} />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">My Bike</Text>
            <Text className="mt-1 text-sm text-muted">
              {bike ? `ODO ${formatOdo(bike.currentOdo)}` : 'Add brand, model, and ODO.'}
            </Text>
          </View>
        </View>

        <View className="gap-4">
          {mileage ? (
            <View className="rounded-3xl bg-card p-5">
              <MileageLine mileage={mileage} prominent />
            </View>
          ) : null}

          <NameField label="Brand" value={brand} onChangeText={setBrand} placeholder="Brand" />
          <NameField label="Model" value={model} onChangeText={setModel} placeholder="Model" />

          <OdoField value={odo} onChangeText={setOdo} />

          {error ? <Text className="text-center text-sm text-danger">{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save bike"
            accessibilityState={{ disabled: !canSave }}
            disabled={!canSave}
            onPress={() => {
              void handleSave();
            }}
            className={
              canSave
                ? 'flex-row items-center justify-center rounded-full bg-primary py-3.5 active:opacity-90'
                : 'flex-row items-center justify-center rounded-full bg-ink/10 py-3.5'
            }>
            <Ionicons name="checkmark" size={18} color={canSave ? colors.white : colors.muted} />
            <Text className={`ml-1.5 text-base font-semibold ${canSave ? 'text-white' : 'text-muted'}`}>
              {saving ? 'Saving…' : 'Save Bike'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
