import { Text, View } from 'react-native';

import { formatMileage, type Mileage } from '@/src/features/fuel/mileage';

type MileageLineProps = {
  mileage: Mileage;
  prominent?: boolean;
};

export function MileageLine({ mileage, prominent = false }: MileageLineProps) {
  if (mileage.kind === 'ready' && prominent) {
    return (
      <View>
        <Text className="text-sm text-muted">Mileage</Text>
        <View className="mt-1 flex-row items-end">
          <Text className="text-3xl font-bold text-primary">{mileage.kmPerLitre.toFixed(1)}</Text>
          <Text className="mb-1 ml-2 text-lg font-semibold text-muted">km/L</Text>
        </View>
        <Text className="mt-2 text-sm text-muted">Distance since the previous fill, divided by litres.</Text>
      </View>
    );
  }

  if (mileage.kind === 'ready') {
    return (
      <Text className="text-sm text-muted">
        Since the last fill, <Text className="font-semibold text-primary">{formatMileage(mileage.kmPerLitre)}</Text>
      </Text>
    );
  }

  const detail =
    mileage.kind === 'abnormal' ? (
      <Text className="text-sm text-warning">That distance and fuel don't make a believable mileage.</Text>
    ) : (
      <Text className="text-sm text-muted">Mileage needs a previous fill with a lower ODO.</Text>
    );

  if (!prominent) return detail;

  return (
    <View>
      <Text className="text-sm text-muted">Mileage</Text>
      <Text className="mt-1 text-base font-semibold text-foreground">
        {mileage.kind === 'abnormal' ? 'Not a believable rate' : 'Not enough fills yet'}
      </Text>
      <View className="mt-2">{detail}</View>
    </View>
  );
}
