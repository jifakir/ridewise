import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPickerModal } from '@/src/components/expenses/CategoryPickerModal';
import { PAYMENT_METHODS, type PaymentMethod } from '@/src/features/expenses/paymentMethods';
import { listCategories, type Category } from '@/src/repositories/categoryRepository';
import { addExpense } from '@/src/repositories/expenseRepository';
import { colors } from '@/src/theme/colors';
import { formatBdt, parseAmount, sanitizeAmountInput } from '@/src/utils/money';

function iconName(icon: string | null): keyof typeof Ionicons.glyphMap {
  if (icon && icon in Ionicons.glyphMap) {
    return icon as keyof typeof Ionicons.glyphMap;
  }
  return 'pricetag-outline';
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function atLocalNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function dateLabel(date: Date, now = new Date()): string {
  const diffDays = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0, 0);
  return next.getTime() > endOfToday().getTime() ? atLocalNoon(new Date()) : next;
}

function SectionHeading({ title }: { title: string }) {
  return <Text className="mb-3 text-lg font-bold text-foreground">{title}</Text>;
}

const PAYMENT_ICONS: Record<PaymentMethod, keyof typeof Ionicons.glyphMap> = {
  Cash: 'cash-outline',
  bKash: 'phone-portrait-outline',
  Nagad: 'wallet-outline',
  Card: 'card-outline',
  Bank: 'business-outline',
};

export function AddExpenseScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const savingRef = useRef(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [date, setDate] = useState(() => new Date());
  const [pickingDate, setPickingDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Categories could not be loaded.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parsedAmount = parseAmount(amount);
  const selected = categories?.find((category) => category.id === categoryId) ?? null;
  const canSave = parsedAmount !== null && selected !== null && !saving;
  const amountInvalid = amount.length > 0 && !amount.endsWith('.') && parsedAmount === null;
  const canPickCategory = (categories?.length ?? 0) > 0;
  const categoryLabel = selected
    ? selected.name
    : loadError
      ? 'Categories unavailable'
      : categories === null
        ? 'Loading categories'
        : categories.length === 0
          ? 'No categories yet'
          : 'Choose a category';

  function clearSaved() {
    setSavedLabel(null);
    setSaveError(null);
  }

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') setPickingDate(false);
    if (event.type !== 'set' || !selectedDate) return;
    setDate(atLocalNoon(selectedDate));
    clearSaved();
  }

  async function handleSave() {
    if (savingRef.current || !canSave || parsedAmount === null || selected === null) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await addExpense({
        amount: parsedAmount,
        categoryId: selected.id,
        date: date.getTime(),
        note,
        paymentMethod,
      });
      setSavedLabel(`Saved ${formatBdt(parsedAmount)} · ${selected.name}`);
      setAmount('');
      setCategoryId(null);
      setNote('');
      setPaymentMethod(null);
      setDate(new Date());
      setDetailsOpen(false);
      setPickingDate(false);
      Keyboard.dismiss();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch {
      setSaveError('Could not save this expense. Try again.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const helper = amountInvalid
    ? 'Enter an amount greater than zero.'
    : saveError
      ? saveError
      : savedLabel
        ? savedLabel
        : 'No amount yet';
  const helperClass = amountInvalid || saveError ? 'text-danger' : savedLabel ? 'text-success' : 'text-muted';

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-5 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-5">
            <Text className="text-2xl font-bold text-foreground">Add Expense</Text>
            <Text className="mt-1 text-sm text-muted">Log food, bills, and the bike.</Text>
          </View>

          <View className="gap-4">
            <View className="rounded-3xl bg-card p-5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
              </View>
              <Text className="mt-3 text-sm text-muted">Amount</Text>
              <View className="mt-1 flex-row items-end">
                <Text className="mb-2 mr-1 text-3xl font-bold text-primary">৳</Text>
                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(sanitizeAmountInput(text));
                    clearSaved();
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel="Amount in taka"
                  className="min-h-[56px] w-0 flex-1 py-0 text-5xl font-bold text-primary"
                />
              </View>
              <Text className={`mt-2 text-sm ${helperClass}`}>{helper}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={selected ? `Category, ${selected.name}` : 'Choose a category'}
              accessibilityState={{ disabled: !canPickCategory }}
              disabled={!canPickCategory}
              onPress={() => {
                Keyboard.dismiss();
                setPickerOpen(true);
              }}
              className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <Ionicons
                  name={iconName(selected?.icon ?? null)}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted">
                  {selected ? (selected.type === 'general' ? 'Daily' : 'Bike') : 'Category'}
                </Text>
                <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
                  {categoryLabel}
                </Text>
              </View>
              {canPickCategory ? (
                <Text className="text-sm font-semibold text-primary">{selected ? 'Change' : 'Choose'}</Text>
              ) : null}
            </Pressable>

            <View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: detailsOpen }}
                accessibilityLabel="Note, payment, and date"
                onPress={() => setDetailsOpen((open) => !open)}
                className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-xs text-muted">Optional</Text>
                  <Text className="mt-0.5 text-base font-bold text-foreground">Note, payment, date</Text>
                </View>
                <Text className="text-sm font-semibold text-primary">{detailsOpen ? 'Hide' : 'Add'}</Text>
              </Pressable>

              {detailsOpen ? (
                <View className="mt-4 gap-4">
                  <View className="rounded-3xl bg-card px-5 py-4">
                    <Text className="text-sm text-muted">Note</Text>
                    <TextInput
                      value={note}
                      onChangeText={(text) => {
                        setNote(text);
                        clearSaved();
                      }}
                      placeholder="What was this for?"
                      placeholderTextColor={colors.muted}
                      accessibilityLabel="Note"
                      maxLength={200}
                      className="mt-1 py-1 text-[18px] font-semibold text-foreground"
                    />
                  </View>

                  <View>
                    <SectionHeading title="Payment" />
                    <View className="overflow-hidden rounded-3xl bg-card">
                      {PAYMENT_METHODS.map((method, index) => {
                        const selectedMethod = method === paymentMethod;
                        return (
                          <Pressable
                            key={method}
                            accessibilityRole="button"
                            accessibilityLabel={method}
                            accessibilityState={{ selected: selectedMethod }}
                            onPress={() => {
                              setPaymentMethod(selectedMethod ? null : method);
                              clearSaved();
                            }}
                            className={`flex-row items-center px-4 py-3 active:opacity-70 ${
                              index > 0 ? 'border-t border-black/5' : ''
                            }`}>
                            <View
                              className={
                                selectedMethod
                                  ? 'h-10 w-10 items-center justify-center rounded-xl bg-primary'
                                  : 'h-10 w-10 items-center justify-center rounded-xl bg-primary/15'
                              }>
                              <Ionicons
                                name={PAYMENT_ICONS[method]}
                                size={20}
                                color={selectedMethod ? colors.white : colors.primary}
                              />
                            </View>
                            <Text
                              numberOfLines={1}
                              className={`ml-3 flex-1 text-[16px] ${
                                selectedMethod ? 'font-bold text-foreground' : 'font-medium text-foreground'
                              }`}>
                              {method}
                            </Text>
                            {selectedMethod ? (
                              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                            ) : (
                              <View className="h-[22px] w-[22px] rounded-full border-2 border-ink/10" />
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {Platform.OS === 'web' ? (
                    <View className="flex-row items-center rounded-3xl bg-card p-4">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Earlier date"
                        onPress={() => {
                          setDate((current) => shiftDays(current, -1));
                          clearSaved();
                        }}
                        className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15 active:opacity-70">
                        <Ionicons name="chevron-back" size={20} color={colors.primary} />
                      </Pressable>
                      <View className="ml-3 flex-1">
                        <Text className="text-xs text-muted">Date</Text>
                        <Text className="mt-0.5 text-base font-bold text-foreground">{dateLabel(date)}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Later date"
                        accessibilityState={{ disabled: isSameDay(date, new Date()) }}
                        disabled={isSameDay(date, new Date())}
                        onPress={() => {
                          setDate((current) => shiftDays(current, 1));
                          clearSaved();
                        }}
                        className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15 active:opacity-70">
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={isSameDay(date, new Date()) ? colors.muted : colors.primary}
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Date, ${dateLabel(date)}`}
                        onPress={() => setPickingDate((open) => !open)}
                        className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-xs text-muted">Date</Text>
                          <Text className="mt-0.5 text-base font-bold text-foreground">{dateLabel(date)}</Text>
                        </View>
                        <Text className="text-sm font-semibold text-primary">Change</Text>
                      </Pressable>
                      {pickingDate ? (
                        <DateTimePicker
                          value={date}
                          mode="date"
                          maximumDate={endOfToday()}
                          display={Platform.OS === 'ios' ? 'inline' : 'default'}
                          onChange={handleDateChange}
                        />
                      ) : null}
                    </View>
                  )}
                </View>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save expense"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              onPress={() => {
                void handleSave();
              }}
              className={
                canSave
                  ? 'flex-row items-center justify-center rounded-full bg-primary py-3.5 active:opacity-90'
                  : 'flex-row items-center justify-center rounded-full bg-ink/10 py-3.5'
              }>
              <Ionicons name="checkmark" size={18} color={canSave ? colors.white : colors.muted} />
              <Text className={`ml-1.5 text-base font-semibold ${canSave ? 'text-white' : 'text-muted'}`}>
                {saving ? 'Saving…' : 'Save Expense'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CategoryPickerModal
        visible={pickerOpen}
        categories={categories ?? []}
        selectedId={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          clearSaved();
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
