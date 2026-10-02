import { type ReactNode } from 'react';
import { View } from 'react-native';

export function SetupIllustrationFrame({ children }: { children: ReactNode }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="h-36 w-full items-center justify-center">
      <View className="absolute h-32 w-32 rounded-full bg-primary/15" />
      {children}
    </View>
  );
}
