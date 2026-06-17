/**
 * FilterBottomSheet — slide-up filter panel for ProductsScreen.
 * Fetches filter categories from /api/v1/menu/filter/list via useMenuFilters().
 *
 * Props:
 *   visible        – boolean
 *   onClose        – () => void
 *   onApply        – (selectedFilters: object) => void
 *   activeFilters   – current filter state (object)
 */

import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useMenuFilters} from '../../hooks/useHeaderNav';
import {colors, fonts, radius, shadows} from '../../theme/theme';

const {height: SCREEN_H} = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.72;

const FilterBottomSheet = ({visible, onClose, onApply, activeFilters = {}}) => {
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {data: filterData, isLoading} = useMenuFilters();

  // Local selection state (applied only on "Apply")
  const [selected, setSelected] = useState({});
  const [expandedKey, setExpandedKey] = useState(null);

  // Parse filter headers from API response
  const filterHeaders = useMemo(() => {
    return filterData?.headers ?? filterData?.data?.headers ?? [];
  }, [filterData]);

  // Sync local state when activeFilters change or sheet opens
  useEffect(() => {
    if (visible) {
      setSelected({...activeFilters});
    }
  }, [visible, activeFilters]);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_H,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const toggleFilter = (filterKey, value) => {
    setSelected(prev => {
      const current = prev[filterKey];
      if (Array.isArray(current)) {
        const exists = current.includes(value);
        const updated = exists
          ? current.filter(v => v !== value)
          : [...current, value];
        return {...prev, [filterKey]: updated.length ? updated : undefined};
      }
      // Single toggle
      return {...prev, [filterKey]: current === value ? undefined : value};
    });
  };

  const toggleRangeFilter = (filterKey, min, max, contentId) => {
    setSelected(prev => {
      const key = `${filterKey}_range`;
      const current = prev[key];
      const rangeStr = `${min}-${max}`;
      if (current === rangeStr) {
        // Deselect
        const next = {...prev};
        delete next[key];
        if (contentId) delete next[`${filterKey}_contentId`];
        return next;
      }
      const next = {...prev, [key]: rangeStr};
      if (contentId) next[`${filterKey}_contentId`] = contentId;
      return next;
    });
  };

  const handleApply = () => {
    // Clean undefined values
    const cleaned = {};
    Object.entries(selected).forEach(([k, v]) => {
      if (v !== undefined) cleaned[k] = v;
    });
    onApply(cleaned);
    onClose();
  };

  const handleClear = () => {
    setSelected({});
  };

  const activeCount = Object.values(selected).filter(
    v => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true),
  ).length;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
        {/* Handle bar */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Content */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading filters...</Text>
            </View>
          ) : filterHeaders.length === 0 ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.loadingText}>No filters available</Text>
            </View>
          ) : (
            filterHeaders.map((header, hIdx) => {
              const filterKey = header.filterKey || header.key || header.name || `filter_${hIdx}`;
              const label = header.label || header.name || header.filterKey || 'Filter';
              const contents = header.filterContent || header.items || [];
              const isExpanded = expandedKey === hIdx;

              return (
                <View key={hIdx} style={styles.filterSection}>
                  {/* Section Header */}
                  <TouchableOpacity
                    style={styles.filterHeader}
                    onPress={() => setExpandedKey(isExpanded ? null : hIdx)}
                    activeOpacity={0.7}>
                    <Text style={styles.filterLabel}>{label}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Filter Options */}
                  {isExpanded && (
                    <View style={styles.filterOptions}>
                      {contents.map((content, cIdx) => {
                        const hasRange = content.minValue !== undefined && content.maxValue !== undefined;
                        const optionLabel =
                          content.label ||
                          content.name ||
                          content.value ||
                          (hasRange ? `${content.minValue} - ${content.maxValue}` : `Option ${cIdx + 1}`);

                        if (hasRange) {
                          const rangeKey = `${filterKey}_range`;
                          const rangeStr = `${content.minValue}-${content.maxValue}`;
                          const isActive = selected[rangeKey] === rangeStr;

                          return (
                            <TouchableOpacity
                              key={cIdx}
                              style={[styles.chip, isActive && styles.chipActive]}
                              onPress={() =>
                                toggleRangeFilter(
                                  filterKey,
                                  content.minValue,
                                  content.maxValue,
                                  content.filterContentId,
                                )
                              }
                              activeOpacity={0.8}>
                              <Text
                                style={[
                                  styles.chipText,
                                  isActive && styles.chipTextActive,
                                ]}>
                                {optionLabel}
                              </Text>
                            </TouchableOpacity>
                          );
                        }

                        // Regular value filter
                        const optionValue = content.value || content.name || content.label || '';
                        const currentVal = selected[filterKey];
                        const isActive = Array.isArray(currentVal)
                          ? currentVal.includes(optionValue)
                          : currentVal === optionValue;

                        return (
                          <TouchableOpacity
                            key={cIdx}
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => toggleFilter(filterKey, optionValue)}
                            activeOpacity={0.8}>
                            <Text
                              style={[
                                styles.chipText,
                                isActive && styles.chipTextActive,
                              ]}>
                              {optionLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Ionicons name="funnel" size={16} color={colors.white} />
            <Text style={styles.applyBtnText}>
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default FilterBottomSheet;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...shadows.lg,
  },

  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sheetTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  clearText: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.semiBold,
    color: colors.primary,
  },

  scrollArea: {flex: 1},
  scrollContent: {paddingBottom: 16},

  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    gap: 12,
  },
  loadingText: {fontSize: 13, color: colors.textSecondary},

  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterLabel: {
    fontSize: fonts.size.base,
    fontWeight: fonts.weight.semiBold,
    color: colors.text,
    flex: 1,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: fonts.weight.medium,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: fonts.weight.bold,
  },

  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: fonts.weight.semiBold,
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMild,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.orange,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: fonts.weight.bold,
    color: colors.white,
  },
});
