import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SpendRow } from '@/src/components/SpendRow';
import { WalletPair } from '@/src/components/home/WalletPair';
import { DEFAULT_CATEGORIES, FUEL_CATEGORY_ID } from '@/src/database/seed/defaultCategories';
import { getMonthReport, getMonthlyTrend, type MonthReport, type TrendPoint } from '@/src/repositories/reportRepository';
import { colors } from '@/src/theme/colors';
import { isSameMonth, monthBounds, monthTitle, shiftMonths, startOfMonth } from '@/src/utils/dates';
import { iconName } from '@/src/utils/icons';
import { formatBdt } from '@/src/utils/money';

const FUEL_ICON = DEFAULT_CATEGORIES.find((category) => category.id === FUEL_CATEGORY_ID)?.icon ?? null;

function MonthStepper({ month, onChange }: { month: Date; onChange: (month: Date) => void }) {
  const atCurrent = isSameMonth(month, new Date());

  return (
    <View className="flex-row items-center rounded-3xl bg-card p-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Earlier month"
        onPress={() => onChange(shiftMonths(month, -1))}
        className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15 active:opacity-70">
        <Ionicons name="chevron-back" size={20} color={colors.primary} />
      </Pressable>
      <View className="ml-3 flex-1">
        <Text className="text-xs text-muted">Month</Text>
        <Text className="mt-0.5 text-base font-bold text-foreground">{monthTitle(month)}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Later month"
        accessibilityState={{ disabled: atCurrent }}
        disabled={atCurrent}
        onPress={() => onChange(shiftMonths(month, 1))}
        className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15 active:opacity-70">
        <Ionicons name="chevron-forward" size={20} color={atCurrent ? colors.muted : colors.primary} />
      </Pressable>
    </View>
  );
}

function TrendCard({ points, selectedStart }: { points: TrendPoint[]; selectedStart: number }) {
  const max = Math.max(...points.map((point) => point.total), 0);

  return (
    <View>
      <Text className="mb-3 text-lg font-bold text-foreground">Last 6 months</Text>
      <View className="overflow-hidden rounded-3xl bg-card">
        {points.map((point, index) => {
          const selected = point.start === selectedStart;
          const width = max > 0 && point.total > 0 ? Math.max((point.total / max) * 100, 8) : 0;
          return (
            <View key={point.start} className={`px-4 py-3 ${index > 0 ? 'border-t border-black/5' : ''}`}>
              <View className="flex-row items-center">
                <Text className={`w-10 text-[16px] ${selected ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                  {point.label}
                </Text>
                <View className="mx-3 h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <View
                    className={`h-2 rounded-full ${selected ? 'bg-primary' : 'bg-ink/20'}`}
                    style={{ width: `${width}%` }}
                  />
                </View>
                <Text className={`text-base font-bold ${selected ? 'text-primary' : 'text-foreground'}`}>
                  {formatBdt(point.total)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center rounded-3xl bg-card px-6 py-10">
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      <Text className="mt-1 text-center text-sm text-muted">{body}</Text>
    </View>
  );
}

export function ReportsScreen() {
  const [month, setMonth] = useState(() => startOfMonth());
  const [report, setReport] = useState<MonthReport | null>(null);
  const [trend, setTrend] = useState<TrendPoint[] | null>(null);
  const [loadedStart, setLoadedStart] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const { start } = monthBounds(month);
  const ready = report !== null && trend !== null && loadedStart === start;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const bounds = monthBounds(month);
      Promise.all([getMonthReport(bounds.start, bounds.end), getMonthlyTrend(month)])
        .then(([nextReport, nextTrend]) => {
          if (cancelled) return;
          setReport(nextReport);
          setTrend(nextTrend);
          setLoadedStart(bounds.start);
          setUnavailable(false);
        })
        .catch(() => {
          if (!cancelled) setUnavailable(true);
        });
      return () => {
        cancelled = true;
      };
    }, [month]),
  );

  const helper =
    report && report.count === 0
      ? 'No spending recorded yet'
      : report?.count === 1
        ? '1 expense this month'
        : `${report?.count ?? 0} expenses this month`;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-2" showsVerticalScrollIndicator={false}>
        <View className="mb-5">
          <Text className="text-2xl font-bold text-foreground">Reports</Text>
          <Text className="mt-1 text-sm text-muted">What you spent, by month.</Text>
        </View>

        <View className="gap-4">
          <MonthStepper month={month} onChange={setMonth} />

          {unavailable && !ready ? (
            <StatusCard title="Reports unavailable" body="Spending could not be loaded." />
          ) : null}

          {!ready && !unavailable ? (
            <StatusCard title="Loading this month" body="Your spending will show up here." />
          ) : null}

          {ready && report && trend ? (
            <>
              <View className="rounded-3xl bg-card p-5">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                </View>
                <Text className="mt-3 text-sm text-muted">Total spent</Text>
                <Text className="mt-1 text-4xl font-bold text-primary">{formatBdt(report.total)}</Text>
                <Text className="mt-2 text-sm text-muted">{helper}</Text>
              </View>

              <WalletPair daily={report.daily} bike={report.bike} />

              <View className="rounded-3xl bg-card p-5">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Ionicons name={iconName(FUEL_ICON)} size={20} color={colors.primary} />
                </View>
                <Text className="mt-3 text-sm text-muted">Fuel</Text>
                <Text className="mt-1 text-2xl font-bold text-primary">{formatBdt(report.fuel)}</Text>
                <Text className="mt-2 text-sm text-muted">
                  {report.fuel === 0 ? 'No fuel logged this month' : 'Fuel logged this month'}
                </Text>
              </View>

              <View>
                <Text className="mb-3 text-lg font-bold text-foreground">Categories</Text>
                {report.categories.length === 0 ? (
                  <StatusCard title="No expenses this month" body="Food, fuel, and other spend will show up here." />
                ) : (
                  <View className="overflow-hidden rounded-3xl bg-card">
                    {report.categories.map((category, index) => (
                      <SpendRow
                        key={category.id}
                        icon={category.icon}
                        label={category.name}
                        amount={category.total}
                        detail={category.type === 'bike' ? 'Bike' : 'Daily'}
                        hairline={index > 0}
                      />
                    ))}
                  </View>
                )}
              </View>

              <TrendCard points={trend} selectedStart={start} />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
