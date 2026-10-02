import { type ReactNode } from 'react';
import { View } from 'react-native';

export function IllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="h-64 w-full items-center justify-center">
      <View className="absolute h-52 w-52 rounded-full bg-primary/15" />
      {children}
    </View>
  );
}
