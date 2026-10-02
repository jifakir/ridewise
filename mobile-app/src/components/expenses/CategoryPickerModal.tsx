import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Category } from '@/src/repositories/categoryRepository';
import { colors } from '@/src/theme/colors';
import { iconName } from '@/src/utils/icons';

const OPEN_MS = 320;
const CLOSE_MS = 220;
const TAB_MS = 240;
const OPEN_EASE = Easing.out(Easing.cubic);
const CLOSE_EASE = Easing.in(Easing.cubic);

type CategoryTab = 'general' | 'bike';

function CategoryList({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <View className="items-center rounded-3xl bg-canvas px-6 py-10">
        <Text className="text-base font-semibold text-foreground">No categories yet</Text>
        <Text className="mt-1 text-center text-sm text-muted">Nothing to choose in this list.</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl bg-canvas">
      {categories.map((category, index) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.name}
            accessibilityState={{ selected }}
            onPress={() => onSelect(category.id)}
            className={`flex-row items-center px-4 py-3 active:opacity-70 ${
              index > 0 ? 'border-t border-black/5' : ''
            }`}>
            <View
              className={
                selected
                  ? 'h-10 w-10 items-center justify-center rounded-xl bg-primary'
                  : 'h-10 w-10 items-center justify-center rounded-xl bg-primary/15'
              }>
              <Ionicons
                name={iconName(category.icon)}
                size={20}
                color={selected ? colors.white : colors.primary}
              />
            </View>
            <Text
              numberOfLines={1}
              className={`ml-3 flex-1 text-[16px] ${
                selected ? 'font-bold text-foreground' : 'font-medium text-foreground'
              }`}>
              {category.name}
            </Text>
            {selected ? (
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

function CategoryTabs({
  tab,
  tabIndex,
  durationMs,
  onChange,
}: {
  tab: CategoryTab;
  tabIndex: SharedValue<number>;
  durationMs: number;
  onChange: (tab: CategoryTab) => void;
}) {
  const segment = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => ({
    width: segment.value,
    transform: [{ translateX: tabIndex.value * segment.value }],
  }));

  function show(next: CategoryTab) {
    if (next === tab) return;
    tabIndex.value = withTiming(next === 'bike' ? 1 : 0, { duration: durationMs, easing: OPEN_EASE });
    onChange(next);
  }

  return (
    <View
      accessibilityRole="tablist"
      className="mx-5 mt-4 flex-row rounded-full bg-canvas p-1"
      onLayout={(event) => {
        segment.value = Math.max((event.nativeEvent.layout.width - 8) / 2, 0);
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
            backgroundColor: colors.card,
          },
          indicatorStyle,
        ]}
      />
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Daily"
        accessibilityState={{ selected: tab === 'general' }}
        onPress={() => show('general')}
        className="flex-1 items-center py-2.5 active:opacity-70">
        <Text className={tab === 'general' ? 'text-sm font-semibold text-primary' : 'text-sm font-medium text-muted'}>
          Daily
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Bike"
        accessibilityState={{ selected: tab === 'bike' }}
        onPress={() => show('bike')}
        className="flex-1 items-center py-2.5 active:opacity-70">
        <Text className={tab === 'bike' ? 'text-sm font-semibold text-primary' : 'text-sm font-medium text-muted'}>
          Bike
        </Text>
      </Pressable>
    </View>
  );
}

type CategoryPickerModalProps = {
  visible: boolean;
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function CategoryPickerModal({
  visible,
  categories,
  selectedId,
  onSelect,
  onClose,
}: CategoryPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const progress = useSharedValue(0);
  const tabIndex = useSharedValue(0);
  const [rendered, setRendered] = useState(false);
  const [tab, setTab] = useState<CategoryTab>('general');
  const [pageWidth, setPageWidth] = useState(0);
  const wasVisible = useRef(false);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const motionMs = useRef({ open: OPEN_MS, close: CLOSE_MS, tab: TAB_MS });
  const selectedType = categories.find((category) => category.id === selectedId)?.type;
  const selectedTypeRef = useRef(selectedType);
  selectedTypeRef.current = selectedType;

  const daily = categories.filter((category) => category.type === 'general');
  const bike = categories.filter((category) => category.type === 'bike');
  const sheetHeight = Math.round(screenHeight * 0.72);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (cancelled || !enabled) return;
      motionMs.current = { open: 0, close: 0, tab: 0 };
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (visible && !wasVisible.current) {
      const next: CategoryTab = selectedTypeRef.current === 'bike' ? 'bike' : 'general';
      setTab(next);
      tabIndex.value = next === 'bike' ? 1 : 0;
      progress.value = 0;
      setRendered(true);
    } else if (!visible && wasVisible.current) {
      const finishClose = () => {
        if (!visibleRef.current) setRendered(false);
      };
      progress.value = withTiming(0, { duration: motionMs.current.close, easing: CLOSE_EASE }, (finished) => {
        if (finished) runOnJS(finishClose)();
      });
    }
    wasVisible.current = visible;
  }, [visible, progress, tabIndex]);

  useEffect(() => {
    if (!rendered || !visible) return;
    progress.value = withTiming(1, { duration: motionMs.current.open, easing: OPEN_EASE });
  }, [rendered, visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.4,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * screenHeight }],
  }));

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -tabIndex.value * pageWidth }],
  }));

  if (!rendered) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal>
      <View className="flex-1 justify-end">
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: colors.ink,
            },
            backdropStyle,
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close categories"
          onPress={onClose}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <Animated.View style={sheetStyle}>
          <View className="overflow-hidden rounded-t-3xl bg-card" style={{ height: sheetHeight }}>
            <View className="flex-row items-center justify-between px-5 pt-4">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-bold text-foreground">Category</Text>
                <Text className="mt-1 text-sm text-muted">Daily or bike.</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={onClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-canvas active:opacity-70">
                <Ionicons name="close" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <CategoryTabs tab={tab} tabIndex={tabIndex} durationMs={motionMs.current.tab} onChange={setTab} />

            <View
              className="mt-4 min-h-0 flex-1"
              onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
              {pageWidth > 0 ? (
                <Animated.View style={[{ width: pageWidth * 2, height: '100%', flexDirection: 'row' }, pagerStyle]}>
                  <CategoryPage
                    width={pageWidth}
                    bottomInset={insets.bottom}
                    categories={daily}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                  <CategoryPage
                    width={pageWidth}
                    bottomInset={insets.bottom}
                    categories={bike}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                </Animated.View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function CategoryPage({
  width,
  bottomInset,
  categories,
  selectedId,
  onSelect,
}: {
  width: number;
  bottomInset: number;
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      style={{ width }}
      contentContainerClassName="px-5"
      contentContainerStyle={{ paddingBottom: bottomInset + 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <CategoryList categories={categories} selectedId={selectedId} onSelect={onSelect} />
    </ScrollView>
  );
}
