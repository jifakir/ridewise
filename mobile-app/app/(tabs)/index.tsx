import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BikeCard } from '@/src/components/home/BikeCard';
import { HomeHeader } from '@/src/components/home/HomeHeader';
import { MonthlySpendingCard } from '@/src/components/home/MonthlySpendingCard';
import { RecentTransactions } from '@/src/components/home/RecentTransactions';
import { WalletPair } from '@/src/components/home/WalletPair';
import { getHomeSummary, type HomeSummary } from '@/src/repositories/homeRepository';

export default function HomeScreen() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getHomeSummary()
        .then((next) => {
          if (cancelled) return;
          setSummary(next);
          setUnavailable(false);
        })
        .catch(() => {
          if (!cancelled) setUnavailable(true);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const total = summary?.total ?? 0;
  const count = summary?.count ?? 0;
  const showUnavailable = unavailable && summary === null;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <View className="gap-4">
          <MonthlySpendingCard total={total} count={count} unavailable={showUnavailable} />
          <WalletPair daily={summary?.daily ?? 0} bike={summary?.bike ?? 0} />
          <BikeCard mileage={summary?.mileage ?? null} />
          <RecentTransactions items={summary?.recent ?? []} unavailable={showUnavailable} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
