import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BikeCard } from '@/src/components/home/BikeCard';
import { HomeHeader } from '@/src/components/home/HomeHeader';
import { MonthlySpendingCard } from '@/src/components/home/MonthlySpendingCard';
import { RecentTransactions } from '@/src/components/home/RecentTransactions';
import { WalletPair } from '@/src/components/home/WalletPair';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <View className="gap-4">
          <MonthlySpendingCard />
          <WalletPair />
          <BikeCard />
          <RecentTransactions />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
