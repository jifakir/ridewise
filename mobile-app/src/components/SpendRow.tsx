import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/src/theme/colors';
import { iconName } from '@/src/utils/icons';
import { formatBdt } from '@/src/utils/money';

type SpendRowProps = {
  icon: string | null;
  label: string;
  amount: number;
  detail?: string | null;
  hairline?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function SpendRow({
  icon,
  label,
  amount,
  detail,
  hairline = false,
  onPress,
  accessibilityLabel,
}: SpendRowProps) {
  const row = (
    <>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name={iconName(icon)} size={20} color={colors.primary} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
          {label}
        </Text>
        {detail ? (
          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <Text className="ml-3 text-base font-bold text-primary">{formatBdt(amount)}</Text>
    </>
  );
  const className = `flex-row items-center px-4 py-3 ${hairline ? 'border-t border-black/5' : ''}`;
  const labelText = accessibilityLabel ?? `${label}, ${formatBdt(amount)}`;

  if (!onPress) {
    return (
      <View accessibilityLabel={labelText} className={className}>
        {row}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={labelText}
      onPress={onPress}
      className={`${className} active:opacity-70`}>
      {row}
    </Pressable>
  );
}
