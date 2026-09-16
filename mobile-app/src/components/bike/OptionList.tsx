import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { OTHER_BRAND } from '@/src/features/bikes/bangladeshMotorcycles';
import { colors } from '@/src/theme/colors';

type OptionListProps = {
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
};

export function filterOptions(options: string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;

  const matches = options.filter(
    (option) => option !== OTHER_BRAND && option.toLowerCase().includes(needle),
  );
  return options.includes(OTHER_BRAND) ? [...matches, OTHER_BRAND] : matches;
}

export function OptionList({ options, selected, onSelect }: OptionListProps) {
  return (
    <View className="overflow-hidden rounded-3xl bg-card">
      {options.map((option, index) => {
        const isSelected = option === selected;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option}
            onPress={() => onSelect(option)}
            className={`flex-row items-center px-4 py-3 active:opacity-70 ${
              index > 0 ? 'border-t border-black/5' : ''
            }`}>
            <View
              className={
                isSelected
                  ? 'h-10 w-10 items-center justify-center rounded-xl bg-primary'
                  : 'h-10 w-10 items-center justify-center rounded-xl bg-primary/15'
              }>
              {option === OTHER_BRAND ? (
                <Ionicons name="add" size={20} color={isSelected ? colors.white : colors.primary} />
              ) : (
                <Text className={`text-base font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>
                  {option.charAt(0)}
                </Text>
              )}
            </View>
            <Text
              numberOfLines={1}
              className={`ml-3 flex-1 text-[16px] ${
                isSelected ? 'font-bold text-foreground' : 'font-medium text-foreground'
              }`}>
              {option}
            </Text>
            {isSelected ? (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            ) : (
              <View className="h-[22px] w-[22px] rounded-full border-2 border-ink/10" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
