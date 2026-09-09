import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';

function WalletCard({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View className="flex-1 rounded-3xl bg-card p-4">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text className="mt-3 text-base font-semibold text-foreground">{title}</Text>
      <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text>
      <Text className="mt-3 text-2xl font-bold text-primary">৳0</Text>
    </View>
  );
}

export function WalletPair() {
  return (
    <View className="flex-row gap-3">
      <WalletCard icon="wallet-outline" title="Daily Wallet" subtitle="Personal expenses" />
      <WalletCard icon="speedometer-outline" title="Bike Wallet" subtitle="Bike-related expenses" />
    </View>
  );
}
