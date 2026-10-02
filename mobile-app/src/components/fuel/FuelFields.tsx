import { Pressable, Text, View } from 'react-native';

import { NameField } from '@/src/components/bike/NameField';
import { OdoField } from '@/src/components/bike/OdoField';
import { MileageLine } from '@/src/components/fuel/MileageLine';
import type { FuelNotice } from '@/src/features/fuel/calculate';
import type { Mileage } from '@/src/features/fuel/mileage';

type FuelFieldsProps = {
  litres: string;
  price: string;
  odo: string;
  notice: FuelNotice | null;
  mileage: Mileage | null;
  needsLowerConfirm: boolean;
  onLitresChange: (text: string) => void;
  onPriceChange: (text: string) => void;
  onOdoChange: (text: string) => void;
  onAllowLowerOdo: () => void;
};

const NOTICE_CLASS = {
  muted: 'text-sm text-muted',
  warning: 'text-sm text-warning',
  danger: 'text-sm text-danger',
} as const;

export function FuelFields({
  litres,
  price,
  odo,
  notice,
  mileage,
  needsLowerConfirm,
  onLitresChange,
  onPriceChange,
  onOdoChange,
  onAllowLowerOdo,
}: FuelFieldsProps) {
  return (
    <View className="gap-4">
      <NameField
        label="Litres"
        value={litres}
        onChangeText={onLitresChange}
        placeholder="0"
        keyboardType="decimal-pad"
        autoCapitalize="none"
      />
      <NameField
        label="Price per litre"
        value={price}
        onChangeText={onPriceChange}
        placeholder="0"
        keyboardType="decimal-pad"
        autoCapitalize="none"
      />
      <OdoField value={odo} onChangeText={onOdoChange} hint="The reading on your dash after this fill." />
      {notice ? <Text className={NOTICE_CLASS[notice.tone]}>{notice.text}</Text> : null}
      {mileage ? <MileageLine mileage={mileage} /> : null}
      {needsLowerConfirm ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use this reading"
          onPress={onAllowLowerOdo}
          className="items-center py-1 active:opacity-70">
          <Text className="text-sm font-semibold text-primary">Use this reading</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
