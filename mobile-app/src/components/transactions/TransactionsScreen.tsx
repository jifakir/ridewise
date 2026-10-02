import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listExpenses,
  type ExpenseListItem,
  type ExpenseTypeFilter,
} from '@/src/repositories/expenseRepository';
import { colors } from '@/src/theme/colors';
import { dayKey, dayLabel } from '@/src/utils/dates';
import { iconName } from '@/src/utils/icons';
import { formatBdt } from '@/src/utils/money';

const FILTERS: { id: ExpenseTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'Daily' },
  { id: 'bike', label: 'Bike' },
];

const TAB_MS = 240;
const TAB_EASE = Easing.out(Easing.cubic);

function detailLine(item: ExpenseListItem): string | null {
  const parts = [item.note, item.paymentMethod].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : null;
}

function groupByDay(items: ExpenseListItem[]): { key: string; label: string; items: ExpenseListItem[] }[] {
  const groups: { key: string; label: string; items: ExpenseListItem[] }[] = [];
  for (const item of items) {
    const key = dayKey(item.date);
    const current = groups[groups.length - 1];
    if (current?.key === key) {
      current.items.push(item);
      continue;
    }
    groups.push({ key, label: dayLabel(item.date), items: [item] });
  }
  return groups;
}

function emptyCopy(search: string, type: ExpenseTypeFilter): { title: string; body: string } {
  if (search.trim()) {
    return {
      title: 'No matching expenses',
      body: 'Try another word, or clear the search.',
    };
  }
  if (type === 'general') {
    return {
      title: 'No daily expenses yet',
      body: 'Food, bills, and other daily spend will show up here.',
    };
  }
  if (type === 'bike') {
    return {
      title: 'No bike expenses yet',
      body: 'Fuel, service, and other bike costs will show up here.',
    };
  }
  return {
    title: 'No expenses yet',
    body: 'Add your first expense and it will show up here.',
  };
}

function HistoryFilter({
  value,
  onChange,
}: {
  value: ExpenseTypeFilter;
  onChange: (value: ExpenseTypeFilter) => void;
}) {
  const index = Math.max(FILTERS.findIndex((filter) => filter.id === value), 0);
  const tabIndex = useSharedValue(index);
  const segment = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => ({
    width: segment.value,
    transform: [{ translateX: tabIndex.value * segment.value }],
  }));

  function show(next: ExpenseTypeFilter, nextIndex: number) {
    if (next === value) return;
    tabIndex.value = withTiming(nextIndex, { duration: TAB_MS, easing: TAB_EASE });
    onChange(next);
  }

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full bg-card p-1"
      onLayout={(event) => {
        segment.value = Math.max((event.nativeEvent.layout.width - 8) / FILTERS.length, 0);
      }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            borderRadius: 999,
            backgroundColor: colors.canvas,
          },
          indicatorStyle,
        ]}
      />
      {FILTERS.map((filter, filterIndex) => {
        const selected = filter.id === value;
        return (
          <Pressable
            key={filter.id}
            accessibilityRole="tab"
            accessibilityLabel={filter.label}
            accessibilityState={{ selected }}
            onPress={() => show(filter.id, filterIndex)}
            className="flex-1 items-center py-2.5 active:opacity-70">
            <Text className={selected ? 'text-sm font-semibold text-primary' : 'text-sm font-medium text-muted'}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TransactionsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ExpenseTypeFilter>('all');
  const [items, setItems] = useState<ExpenseListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      listExpenses({ search, type })
        .then((rows) => {
          if (cancelled) return;
          setItems(rows);
          setError(null);
        })
        .catch(() => {
          if (!cancelled) setError('Transactions could not be loaded.');
        });
      return () => {
        cancelled = true;
      };
    }, [search, type]),
  );

  const groups = items ? groupByDay(items) : [];
  const empty = emptyCopy(search, type);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-2xl font-bold text-foreground">Transactions</Text>
          <Text className="mt-1 text-sm text-muted">Every expense on this phone.</Text>
        </View>

        <View className="gap-4">
          <View className="flex-row items-center rounded-2xl bg-card px-4">
            <Ionicons name="search-outline" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search expenses"
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Search expenses"
              className="flex-1 px-3 py-3 text-[16px] text-foreground"
            />
            {search.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearch('')}
                className="py-2 pl-1 active:opacity-70">
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>

          <HistoryFilter value={type} onChange={setType} />

          {error && items === null ? (
            <View className="items-center rounded-3xl bg-card px-6 py-10">
              <Text className="text-base font-semibold text-foreground">Transactions unavailable</Text>
              <Text className="mt-1 text-center text-sm text-muted">{error}</Text>
            </View>
          ) : null}

          {items === null && !error ? (
            <View className="items-center rounded-3xl bg-card px-6 py-10">
              <Text className="text-base font-semibold text-foreground">Loading transactions</Text>
              <Text className="mt-1 text-center text-sm text-muted">Your expenses will show up here.</Text>
            </View>
          ) : null}

          {items !== null && items.length === 0 ? (
            <View className="items-center rounded-3xl bg-card px-6 py-10">
              <Text className="text-base font-semibold text-foreground">{empty.title}</Text>
              <Text className="mt-1 text-center text-sm text-muted">{empty.body}</Text>
            </View>
          ) : null}

          {groups.map((group) => (
            <View key={group.key}>
              <Text className="mb-3 text-lg font-bold text-foreground">{group.label}</Text>
              <View className="overflow-hidden rounded-3xl bg-card">
                {group.items.map((item, index) => {
                  const detail = detailLine(item);
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.categoryName}, ${formatBdt(item.amount)}`}
                      onPress={() => router.push(`/expense/${item.id}`)}
                      className={`flex-row items-center px-4 py-3 active:opacity-70 ${
                        index > 0 ? 'border-t border-black/5' : ''
                      }`}>
                      <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                        <Ionicons name={iconName(item.categoryIcon)} size={20} color={colors.primary} />
                      </View>
                      <View className="ml-3 min-w-0 flex-1">
                        <Text numberOfLines={1} className="text-[16px] font-medium text-foreground">
                          {item.categoryName}
                        </Text>
                        {detail ? (
                          <Text numberOfLines={1} className="mt-0.5 text-sm text-muted">
                            {detail}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="ml-3 text-base font-bold text-primary">{formatBdt(item.amount)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
