import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/src/theme/colors';

type TabBarRenderProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_ICONS = {
  index: { active: 'home', inactive: 'home-outline' },
  transactions: { active: 'list', inactive: 'list-outline' },
  reports: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  more: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' },
} as const;

function labelFor(name: string) {
  if (name === 'index') return 'Home';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function AppTabBar({ state, navigation }: TabBarRenderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-end border-t border-black/5 bg-card px-2 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        if (route.name === 'add') {
          return (
            <View key={route.key} className="flex-1 items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add expense"
                onPress={() => navigation.navigate(route.name)}
                className="-mt-7 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-90">
                <Ionicons name="add" size={32} color={colors.white} />
              </Pressable>
              <Text className="mt-1 text-[11px] font-semibold text-muted">Add</Text>
            </View>
          );
        }

        const icons = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
        if (!icons) {
          return null;
        }
        const color = isFocused ? colors.primary : colors.muted;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={labelFor(route.name)}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            className="flex-1 items-center py-1 active:opacity-70">
            <Ionicons name={isFocused ? icons.active : icons.inactive} size={22} color={color} />
            <Text
              className={`mt-1 text-[11px] ${isFocused ? 'font-semibold text-primary' : 'font-medium text-muted'}`}>
              {labelFor(route.name)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
