import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandIllustration } from '@/src/components/bike/illustrations/BrandIllustration';
import { ModelIllustration } from '@/src/components/bike/illustrations/ModelIllustration';
import { OdoIllustration } from '@/src/components/bike/illustrations/OdoIllustration';
import { filterOptions, OptionList } from '@/src/components/bike/OptionList';
import {
  BRAND_NAMES,
  modelsForBrand,
  OTHER_BRAND,
} from '@/src/features/bikes/bangladeshMotorcycles';
import { colors } from '@/src/theme/colors';

type BikeSetupScreenProps = {
  busy?: boolean;
  onSave: (bike: { brand: string; model: string; currentOdo: number }) => void;
};

function parseOdo(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const odo = Number(trimmed);
  if (!Number.isSafeInteger(odo) || odo < 0) return null;
  return odo;
}

function StepBar({ step }: { step: number }) {
  return (
    <View className="mt-4 flex-row gap-1.5 px-5">
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          className={index <= step ? 'h-1 flex-1 rounded-full bg-primary' : 'h-1 flex-1 rounded-full bg-ink/10'}
        />
      ))}
    </View>
  );
}

function StepCard({
  title,
  body,
  illustration,
  stacked = false,
}: {
  title: string;
  body: string;
  illustration: ReactNode;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <View className="items-center rounded-3xl bg-card px-5 pb-6 pt-5">
        {illustration}
        <Text className="mt-2 text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-center text-sm leading-5 text-muted">{body}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-stretch overflow-hidden rounded-3xl bg-card">
      <View className="flex-1 justify-center py-5 pl-5 pr-2">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-muted">{body}</Text>
      </View>
      <View className="w-[124px] items-center justify-center bg-primary/10">{illustration}</View>
    </View>
  );
}

function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View className="mt-4 flex-row items-center rounded-2xl bg-card px-4">
      <Ionicons name="search-outline" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel={placeholder}
        className="flex-1 px-3 py-3 text-[16px] text-foreground"
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          className="py-2 pl-1 active:opacity-70">
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function NameField({
  value,
  onChangeText,
  label,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <View className="mt-3 rounded-3xl bg-card px-5 py-4">
      <Text className="text-sm text-muted">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize="words"
        autoCorrect={false}
        accessibilityLabel={label}
        className="mt-1 py-1 text-[18px] font-semibold text-foreground"
      />
    </View>
  );
}

function ListHeading({ label, count }: { label: string; count: number }) {
  return (
    <View className="mb-2 mt-5 flex-row items-end justify-between px-1">
      <Text className="text-base font-bold text-foreground">{label}</Text>
      <Text className="text-sm text-muted">{count}</Text>
    </View>
  );
}

export function BikeSetupScreen({ busy = false, onSave }: BikeSetupScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState('');
  const [brandChoice, setBrandChoice] = useState<string | null>(null);
  const [customBrand, setCustomBrand] = useState('');
  const [modelChoice, setModelChoice] = useState<string | null>(null);
  const [customModel, setCustomModel] = useState('');
  const [odo, setOdo] = useState('');

  const models = useMemo(
    () => (brandChoice && brandChoice !== OTHER_BRAND ? modelsForBrand(brandChoice) : [OTHER_BRAND]),
    [brandChoice],
  );
  const visibleBrands = useMemo(() => filterOptions(BRAND_NAMES, query), [query]);
  const visibleModels = useMemo(() => filterOptions(models, query), [models, query]);
  const customModelOnly = brandChoice === OTHER_BRAND;

  const brandValue = brandChoice === OTHER_BRAND ? customBrand.trim() : (brandChoice ?? '').trim();
  const modelValue = modelChoice === OTHER_BRAND ? customModel.trim() : (modelChoice ?? '').trim();
  const currentOdo = parseOdo(odo);

  const canContinue =
    step === 0
      ? brandValue.length > 0
      : step === 1
        ? modelValue.length > 0
        : currentOdo !== null && !busy;

  function goToStep(next: number) {
    setQuery('');
    setStep(next);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function handleBrandSelect(value: string) {
    setBrandChoice(value);
    setModelChoice(null);
    setCustomModel('');
    if (value !== OTHER_BRAND) setCustomBrand('');
  }

  function handleNext() {
    if (!canContinue) return;
    if (step < 2) {
      if (step === 0 && brandChoice === OTHER_BRAND) {
        setModelChoice(OTHER_BRAND);
      }
      goToStep(step + 1);
      return;
    }
    if (currentOdo === null) return;
    onSave({ brand: brandValue, model: modelValue, currentOdo });
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="mx-auto w-full max-w-md flex-1">
          <View className="flex-row items-center justify-between px-5 pt-2">
            <View className="flex-1 flex-row items-center pr-3">
              {step > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  onPress={() => goToStep(step - 1)}
                  className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-card active:opacity-70">
                  <Ionicons name="chevron-back" size={20} color={colors.foreground} />
                </Pressable>
              ) : null}
              <Text className="text-2xl font-bold text-foreground">My Bike</Text>
            </View>
            <View className="rounded-full bg-card px-3 py-1.5">
              <Text className="text-sm font-medium text-foreground">Step {step + 1} of 3</Text>
            </View>
          </View>

          <StepBar step={step} />

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="px-5 pb-6 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {step === 0 ? (
              <>
                <StepCard
                  title="Brand"
                  body="Who made your motorbike?"
                  illustration={<BrandIllustration />}
                />
                <SearchField value={query} onChangeText={setQuery} placeholder="Search brands" />
                {brandChoice === OTHER_BRAND ? (
                  <NameField
                    value={customBrand}
                    onChangeText={setCustomBrand}
                    label="Brand name"
                    placeholder="Type the brand"
                  />
                ) : null}
                <ListHeading label="Brands" count={visibleBrands.length} />
                {visibleBrands.length > 0 ? (
                  <OptionList
                    options={visibleBrands}
                    selected={brandChoice}
                    onSelect={handleBrandSelect}
                  />
                ) : (
                  <View className="items-center rounded-3xl bg-card px-6 py-10">
                    <Text className="text-base font-semibold text-foreground">No brand found</Text>
                    <Text className="mt-1 text-center text-sm text-muted">
                      Clear the search and pick Others to type it yourself.
                    </Text>
                  </View>
                )}
              </>
            ) : null}

            {step === 1 ? (
              <>
                <StepCard
                  title="Model"
                  body={`Which ${brandValue} do you ride?`}
                  illustration={<ModelIllustration />}
                />
                {customModelOnly ? (
                  <NameField
                    value={customModel}
                    onChangeText={setCustomModel}
                    label="Model name"
                    placeholder="Type the model"
                  />
                ) : (
                  <>
                    <SearchField value={query} onChangeText={setQuery} placeholder="Search models" />
                    {modelChoice === OTHER_BRAND ? (
                      <NameField
                        value={customModel}
                        onChangeText={setCustomModel}
                        label="Model name"
                        placeholder="Type the model"
                      />
                    ) : null}
                    <ListHeading label="Models" count={visibleModels.length} />
                    {visibleModels.length > 0 ? (
                      <OptionList
                        options={visibleModels}
                        selected={modelChoice}
                        onSelect={setModelChoice}
                      />
                    ) : (
                      <View className="items-center rounded-3xl bg-card px-6 py-10">
                        <Text className="text-base font-semibold text-foreground">No model found</Text>
                        <Text className="mt-1 text-center text-sm text-muted">
                          Clear the search and pick Others to type it yourself.
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <StepCard
                  stacked
                  title="ODO"
                  body="Read the odometer on your dash and enter it here."
                  illustration={<OdoIllustration />}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change brand and model"
                  onPress={() => goToStep(0)}
                  className="mt-3 flex-row items-center rounded-3xl bg-card p-4 active:opacity-70">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs text-muted">Your motorbike</Text>
                    <Text numberOfLines={1} className="mt-0.5 text-base font-bold text-foreground">
                      {brandValue} {modelValue}
                    </Text>
                  </View>
                  <Text className="text-sm font-semibold text-primary">Change</Text>
                </Pressable>

                <View className="mt-3 rounded-3xl bg-card p-5">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                    <Ionicons name="speedometer-outline" size={20} color={colors.primary} />
                  </View>
                  <Text className="mt-3 text-sm text-muted">Current reading</Text>
                  <View className="mt-1 flex-row items-end">
                    <TextInput
                      value={odo}
                      onChangeText={setOdo}
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      accessibilityLabel="Current odometer"
                      className="min-h-[56px] w-0 flex-1 py-0 text-5xl font-bold text-primary"
                    />
                    <Text className="mb-3 ml-2 text-lg font-semibold text-muted">km</Text>
                  </View>
                  <Text className="mt-2 text-sm text-muted">
                    Mileage and fuel costs are counted from this reading.
                  </Text>
                </View>
              </>
            ) : null}
          </ScrollView>

          <View className="px-5 pb-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={step === 2 ? 'Save motorbike' : 'Continue'}
              accessibilityState={{ disabled: !canContinue }}
              disabled={!canContinue}
              onPress={handleNext}
              className={
                canContinue
                  ? 'flex-row items-center justify-center rounded-full bg-primary py-3.5 active:opacity-90'
                  : 'flex-row items-center justify-center rounded-full bg-ink/10 py-3.5'
              }>
              <Text className={`text-base font-semibold ${canContinue ? 'text-white' : 'text-muted'}`}>
                {step === 2 ? 'Save Bike' : 'Continue'}
              </Text>
              <View className="ml-1.5">
                <Ionicons
                  name={step === 2 ? 'checkmark' : 'arrow-forward'}
                  size={18}
                  color={canContinue ? colors.white : colors.muted}
                />
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
