import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Shadows } from '../theme';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { AppChip } from '../components/AppChip';

const CATEGORIES = ['All', 'Flowers', 'Forever Roses', 'Gift Bundles', 'Plants', 'Flower Boxes'];
const FLOWER_TYPES = ['All', 'Roses', 'Lilies', 'Orchids', 'Tulips', 'Peonies', 'Mixed'];
const OCCASIONS = ['All', 'Birthday', 'Anniversary', 'Love & Romance', 'Congratulations', 'Wedding', 'Sympathy'];
const RECIPIENTS = ['Everyone', 'For Her', 'For Him', 'For Mom', 'BFFs'];
const SORTS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Best Rated', value: 'rating' },
];

export default function FiltersModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState('All');
  const [flowerType, setFlowerType] = useState('All');
  const [occasion, setOccasion] = useState('All');
  const [recipient, setRecipient] = useState('Everyone');
  const [sort, setSort] = useState('recommended');

  const handleApply = () => {
    router.replace({
      pathname: '/(tabs)/shop',
      params: {
        category: category !== 'All' ? category : undefined,
        occasion: occasion !== 'All' ? occasion : undefined,
      },
    });
  };

  const handleReset = () => {
    setCategory('All');
    setFlowerType('All');
    setOccasion('All');
    setRecipient('Everyone');
    setSort('recommended');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 4x36 Drag handle */}
      <View style={styles.dragHandle} />

      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h2" weight="semiBold">
          Filter & Refine
        </AppText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close filters"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Section */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Category
          </AppText>
          <View style={styles.chipsWrap}>
            {CATEGORIES.map((cat) => (
              <AppChip
                key={cat}
                label={cat}
                selected={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>
        </View>

        {/* Flower Type */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Flower Variety
          </AppText>
          <View style={styles.chipsWrap}>
            {FLOWER_TYPES.map((type) => (
              <AppChip
                key={type}
                label={type}
                selected={flowerType === type}
                onPress={() => setFlowerType(type)}
              />
            ))}
          </View>
        </View>

        {/* Occasion */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Occasion
          </AppText>
          <View style={styles.chipsWrap}>
            {OCCASIONS.map((occ) => (
              <AppChip
                key={occ}
                label={occ}
                selected={occasion === occ}
                onPress={() => setOccasion(occ)}
              />
            ))}
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Recipient
          </AppText>
          <View style={styles.chipsWrap}>
            {RECIPIENTS.map((rec) => (
              <AppChip
                key={rec}
                label={rec}
                selected={recipient === rec}
                onPress={() => setRecipient(rec)}
              />
            ))}
          </View>
        </View>

        {/* Sort Order */}
        <View style={styles.section}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Sort By
          </AppText>
          <View style={styles.chipsWrap}>
            {SORTS.map((s) => (
              <AppChip
                key={s.value}
                label={s.label}
                selected={sort === s.value}
                onPress={() => setSort(s.value)}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Apply / Reset Footer respecting Safe Area */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <AppButton
          title="Reset"
          variant="secondary"
          onPress={handleReset}
          style={styles.resetBtn}
        />
        <AppButton
          title="Apply Filters"
          variant="primary"
          onPress={handleApply}
          style={styles.applyBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});
