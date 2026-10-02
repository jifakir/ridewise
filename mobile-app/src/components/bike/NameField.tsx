import { Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { colors } from '@/src/theme/colors';

type NameFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  className?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function NameField({
  label,
  value,
  onChangeText,
  placeholder,
  className,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: NameFieldProps) {
  return (
    <View className={`rounded-3xl bg-card px-5 py-4 ${className ?? ''}`}>
      <Text className="text-sm text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
        className="mt-1 py-1 text-[18px] font-semibold text-foreground"
      />
    </View>
  );
}
