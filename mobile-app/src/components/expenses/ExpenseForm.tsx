import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { FuelFields } from '@/src/components/fuel/FuelFields';
import { BackButton } from '@/src/components/navigation/BackButton';
import { FUEL_CATEGORY_ID } from '@/src/database/seed';
import { parseOdo } from '@/src/features/bikes/odo';
import { PAYMENT_METHODS, type PaymentMethod } from '@/src/features/expenses/paymentMethods';
import { fuelEntryState, sanitizeVolumeInput, type FuelCapture } from '@/src/features/fuel/calculate';
import { formatMileage, mileageFromFill } from '@/src/features/fuel/mileage';
import { listCategories, type Category } from '@/src/repositories/categoryRepository';
import type { ExpenseChanges } from '@/src/repositories/expenseRepository';
import { priorFuelOdo } from '@/src/repositories/fuelRepository';
import { colors } from '@/src/theme/colors';
import { atLocalNoon, dayLabel, endOfToday, isSameDay, shiftDays } from '@/src/utils/dates';
import { iconName } from '@/src/utils/icons';
import { formatBdt, parseAmount, sanitizeAmountInput } from '@/src/utils/money';

export type ExpenseDraft = ExpenseChanges & {
  fuel?: FuelCapture;
};

const PAYMENT_ICONS: Record<PaymentMethod, keyof typeof Ionicons.glyphMap> = {
  Cash: 'cash-outline',
  bKash: 'phone-portrait-outline',
  Nagad: 'wallet-outline',
  Card: 'card-outline',
  Bank: 'business-outline',
};

type ExpenseFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  edges?: ('top' | 'bottom')[];
  onBack?: () => void;
  initialAmount?: string;
  initialCategoryId?: string | null;
  initialNote?: string;
  initialPaymentMethod?: PaymentMethod | null;
  initialDate?: Date;
  startWithDetails?: boolean;
  resetOnSuccess?: boolean;
  captureFuel?: boolean;
  activeOdo?: number | null;
  onDelete?: () => Promise<void>;
  onSubmit: (draft: ExpenseDraft) => Promise<void>;
};

function SectionHeading({ title }: { title: string }) {
  return <Text className="mb-3 text-lg font-bold text-foreground">{title}</Text>;
}

export function ExpenseForm({
  title,
  subtitle,
  submitLabel,
  edges = ['top'],
  onBack,
  initialAmount = '',
  initialCategoryId = null,
  initialNote = '',
  initialPaymentMethod = null,
  initialDate,
  startWithDetails = false,
  resetOnSuccess = false,
  captureFuel = false,
  activeOdo = null,
  onDelete,
  onSubmit,
}: ExpenseFormProps) {
  const scrollRef = useRef<ScrollView>(null);
  const savingRef = useRef(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState(initialAmount);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(startWithDetails);
  const [note, setNote] = useState(initialNote);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(initialPaymentMethod);
  const [date, setDate] = useState(() => initialDate ?? new Date());
  const [pickingDate, setPickingDate] = useState(false);
  const [litres, setLitres] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState('');
  const [odo, setOdo] = useState('');
  const [allowLowerOdo, setAllowLowerOdo] = useState(false);
  const [priorOdo, setPriorOdo] = useState<{ reading: number; previous: number | null } | null>(null);
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
  const fuelMode = captureFuel && selected?.id === FUEL_CATEGORY_ID;
  const fuel = fuelMode
    ? fuelEntryState({
        amount: parsedAmount,
        litresText: litres,
        priceText: pricePerLitre,
        odoText: odo,
        activeOdo,
        allowLowerOdo,
      })
    : null;
  const canSave = parsedAmount !== null && selected !== null && !saving && (fuel === null || fuel.canSave);
  const reading = fuelMode ? parseOdo(odo) : null;
  const previousOdo = priorOdo && reading !== null && priorOdo.reading === reading ? priorOdo.previous : undefined;
  const mileage =
    fuel?.canSave && fuel.capture && fuel.litresForMileage != null && previousOdo !== undefined
      ? mileageFromFill({ previousOdo, odo: fuel.capture.odo, litres: fuel.litresForMileage })
      : null;

  useEffect(() => {
    if (!fuelMode || reading === null) return;
    let cancelled = false;
    priorFuelOdo(reading)
      .then((previous) => {
        if (!cancelled) setPriorOdo({ reading, previous });
      })
      .catch(() => {
        if (!cancelled) setPriorOdo({ reading, previous: null });
      });
    return () => {
      cancelled = true;
    };
  }, [fuelMode, reading]);
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
    const draft: ExpenseDraft = {
      amount: parsedAmount,
      categoryId: selected.id,
      date: date.getTime(),
      note,
      paymentMethod,
    };
    if (fuel?.capture) draft.fuel = fuel.capture;
    let leaving = false;
    try {
      await onSubmit(draft);
      if (!resetOnSuccess) {
        leaving = true;
        return;
      }
      const mileageLabel = mileage?.kind === 'ready' ? ` · ${formatMileage(mileage.kmPerLitre)}` : '';
      setSavedLabel(`Saved ${formatBdt(parsedAmount)} · ${selected.name}${mileageLabel}`);
      setAmount('');
      setCategoryId(null);
      setLitres('');
      setPricePerLitre('');
      setOdo('');
      setAllowLowerOdo(false);
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
      if (!leaving) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  }

  function confirmDelete() {
    if (!onDelete || savingRef.current) return;
    Alert.alert('Delete this expense?', 'It will leave your history.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void runDelete();
        },
      },
    ]);
  }

  async function runDelete() {
    if (!onDelete || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      await onDelete();
    } catch {
      setSaveError('Could not delete this expense. Try again.');
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
    <SafeAreaView className="flex-1 bg-canvas" edges={edges}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="px-5 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="mb-5 flex-row items-center">
            {onBack ? (
              <View className="mr-3">
                <BackButton onPress={onBack} />
              </View>
            ) : null}
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{title}</Text>
              <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
            </View>
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
                <Ionicons name={iconName(selected?.icon)} size={20} color={colors.primary} />
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

            {fuelMode && fuel ? (
              <FuelFields
                litres={litres}
                price={pricePerLitre}
                odo={odo}
                notice={fuel.notice}
                mileage={mileage}
                needsLowerConfirm={fuel.needsLowerConfirm}
                onLitresChange={(text) => {
                  setLitres(sanitizeVolumeInput(text));
                  clearSaved();
                }}
                onPriceChange={(text) => {
                  setPricePerLitre(sanitizeAmountInput(text));
                  clearSaved();
                }}
                onOdoChange={(text) => {
                  setOdo(text);
                  setAllowLowerOdo(false);
                  clearSaved();
                }}
                onAllowLowerOdo={() => {
                  setAllowLowerOdo(true);
                  clearSaved();
                }}
              />
            ) : null}

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
                        <Text className="mt-0.5 text-base font-bold text-foreground">{dayLabel(date)}</Text>
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
                        accessibilityLabel={`Date, ${dayLabel(date)}`}
                        onPress={() => setPickingDate((open) => !open)}
                        className="flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-xs text-muted">Date</Text>
                          <Text className="mt-0.5 text-base font-bold text-foreground">{dayLabel(date)}</Text>
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
              accessibilityLabel={submitLabel}
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
                {saving ? 'Saving…' : submitLabel}
              </Text>
            </Pressable>

            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete expense"
                disabled={saving}
                onPress={confirmDelete}
                className="items-center py-2 active:opacity-70">
                <Text className="text-base font-semibold text-danger">Delete expense</Text>
              </Pressable>
            ) : null}
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
