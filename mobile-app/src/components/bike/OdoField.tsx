import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, View } from 'react-native';

import { colors } from '@/src/theme/colors';

type OdoFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  hint?: string;
  className?: string;
};

export function OdoField({
  value,
  onChangeText,
  hint = 'Mileage and fuel costs are counted from this reading.',
  className,
}: OdoFieldProps) {
  return (
    <View className={`rounded-3xl bg-card p-5 ${className ?? ''}`}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
      </View>
      <Text className="mt-3 text-sm text-muted">Current reading</Text>
      <View className="mt-1 flex-row items-end">
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^\d]/g, ''))}
          placeholder="0"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          accessibilityLabel="Current odometer"
          className="min-h-[56px] w-0 flex-1 py-0 text-5xl font-bold text-primary"
        />
        <Text className="mb-3 ml-2 text-lg font-semibold text-muted">km</Text>
      </View>
      <Text className="mt-2 text-sm text-muted">{hint}</Text>
    </View>
  );
}
