/**
 * HeroBannerSection — React Native port of the web HeroBanner component.
 * Renders four layouts driven entirely by the banner config:
 *   1. showArrows (isCategory)  → horizontal category strip with prev/next arrows
 *   2. scrollable               → full-width paging carousel (auto-scroll / dots)
 *   3. mobileRows               → fixed multi-row grid
 *   4. default                  → grid with `visibleCount.mobile` columns
 *
 * Every image is sized from its OWN aspect ratio (mobile.ratio), so banners
 * fit correctly with no distortion.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import {
  resolveImageMeta,
  parseLinkParams,
  ratioToFraction,
} from '../../utils/imageUtils';
import { colors, fonts } from '../../theme/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// BannerImage — single image tile (height derived from the image's own ratio)
// ─────────────────────────────────────────────────────────────────────────────
const BannerImage = ({
  meta,
  width,
  height,
  onPress,
  borderRadius = 10,
  resizeMode = 'cover',
}) => {
  const [loaded, setLoaded] = useState(false);

  if (!meta?.uri) return null;

  const hasAction = !!(meta.link || meta.filterId);

  return (
     <TouchableOpacity
      onPress={() => hasAction && onPress(meta)}
      activeOpacity={hasAction ? 0.85 : 1}
      disabled={!hasAction}>
      <View
        style={{
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
        }}>
        {!loaded && (
          <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
            <ActivityIndicator size="small" />
          </View>
        )}

        <Image
          source={{uri: meta.uri}}
          style={{width, height}}
          resizeMode={resizeMode}
          onLoad={() => setLoaded(true)}
        />
      </View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ArrowButton
// ─────────────────────────────────────────────────────────────────────────────
const ArrowButton = ({ onPress, disabled, label }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    accessibilityLabel={label}
    style={[
      styles.arrowBtn,
      disabled ? styles.arrowBtnDisabled : styles.arrowBtnActive,
    ]}>
    <Text
      style={[
        styles.arrowBtnText,
        disabled ? styles.arrowBtnTextDisabled : styles.arrowBtnTextActive,
      ]}>
      {label === 'Previous' ? '‹' : '›'}
    </Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const HeroBannerSection = ({ banner = {}, onBannerPress }) => {
  const {
    title,
    description,
    images = [],
    defaultRatio = '16/9',
    centered = false,
    backgroundColor = 'white',
    mobileRows = null,
    scrollInterval = 3000,
    infinite = false,
    dots = false,
  } = banner;
 //backgroundColor=#ffffff,
// centered= false,
// description= ,
// displayOrder= 1,
// dots= true,
// full= true,
// gap= false,
// imageKey= heroBanner,
// images= [{desktop= [Object],
// isSingle= false,
// mobile= [Object]}, {desktop= [Object],
// isSingle= false,
// mobile= [Object]}],
// infinite= true,
// isCategory= null,
// isGrid= false,
// isVisible= true,
// is_single= false,
// mobileGap= false,
// rowSpan= null,
// scrollInterval= 3000,
// scrollable= true,
// title= ,
// visibleCount= {desktop= 1,
// mobile= 1,
// tablet= 1,

  

  // ── Field-name normalisation (API uses different casing than the web props) ─
  const gap = banner.gap !== undefined ? banner.gap : true;
  // mobileGap takes priority on mobile; fall back to `gap` when not provided.
  const wantGap =
    banner.mobileGap != null ? banner.mobileGap : gap;
  const autoScroll = banner.autoScroll ?? banner.autoscroll ?? false;
  const scrollable = banner.scrollable ?? false;
  // Web maps `showArrows = banner.isCategory`
  const showArrows = banner.showArrows ?? !!banner.isCategory;
  const visibleCount = banner.visibleCount || { desktop: 1, tablet: 2, mobile: 1 };
  const mobileVisible = Math.max(1, visibleCount?.mobile || 1);

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  // Resolve every image once (mobile source + its own ratio).
  const metas = images.map(img => resolveImageMeta(img, true, defaultRatio));

  const fractionOf = meta => ratioToFraction(meta?.ratio || defaultRatio);

  const totalSlides = images.length;
  const maxIndex = infinite
    ? totalSlides - 1
    : Math.max(0, totalSlides - mobileVisible);

  const atStart = activeIndex === 0;
  const atEnd = activeIndex >= maxIndex;

  const handlePress = useCallback(
    meta => {
      if (onBannerPress) onBannerPress(parseLinkParams(meta.link), meta);
    },
    [onBannerPress],
  );

  const nextSlide = useCallback(() => {
    setActiveIndex(prev => {
      if (infinite) return (prev + 1) % totalSlides;
      const next = prev + 1;
      return next > maxIndex ? 0 : next;
    });
  }, [infinite, totalSlides, maxIndex]);

  const prevSlide = useCallback(() => {
    setActiveIndex(prev => {
      if (infinite) return (prev - 1 + totalSlides) % totalSlides;
      const p = prev - 1;
      return p < 0 ? maxIndex : p;
    });
  }, [infinite, totalSlides, maxIndex]);

  useEffect(() => {
    if (!autoScroll || !scrollable || totalSlides <= 1) return;
    timerRef.current = setInterval(nextSlide, scrollInterval);
    return () => clearInterval(timerRef.current);
  }, [autoScroll, scrollable, scrollInterval, nextSlide, totalSlides]);

  useEffect(() => {
    if (!flatListRef.current) return;
    try {
      flatListRef.current.scrollToIndex({ index: activeIndex, animated: true });
    } catch (_) {}
  }, [activeIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderRelease: (_, gs) => {
        if (Math.abs(gs.dx) > 40) {
          gs.dx < 0 ? nextSlide() : prevSlide();
        }
      },
    }),
  ).current;

  const Header = () => (
    <>
      {title ? (
        <Text style={[styles.sectionTitle, centered && styles.centeredText]}>
          {title}
        </Text>
      ) : null}
      {description ? (
        <Text style={[styles.sectionDesc, centered && styles.centeredText]}>
          {description}
        </Text>
      ) : null}
    </>
  );

  // ════════════════════════════════════════════════════════════════════════
  // MODE 1: showArrows — category strip (e.g. "Bmg World")
  // ════════════════════════════════════════════════════════════════════════
  if (showArrows) {
    const GAP = gap ? 10 : 0;
    const itemW = (SCREEN_W - GAP * (mobileVisible + 1)) / mobileVisible;

    return (
      <View style={[styles.section, { backgroundColor }]}>
        {(title || description) && (
          <View style={styles.arrowsTitleRow}>
            <View style={styles.arrowsTitleText}>
              {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
              {description ? (
                <Text style={styles.sectionDesc}>{description}</Text>
              ) : null}
            </View>
            <View style={styles.arrowsGroup}>
              <ArrowButton
                label="Previous"
                onPress={prevSlide}
                disabled={!infinite && atStart}
              />
              <View style={{ width: 8 }} />
              <ArrowButton
                label="Next"
                onPress={nextSlide}
                disabled={!infinite && atEnd}
              />
            </View>
          </View>
        )}

        <View style={{ overflow: 'hidden' }} {...panResponder.panHandlers}>
          <FlatList
            ref={flatListRef}
            data={metas}
            keyExtractor={(_, i) => String(i)}
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={itemW + GAP}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: GAP }}
            ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
            getItemLayout={(_, index) => ({
              length: itemW + GAP,
              offset: (itemW + GAP) * index,
              index,
            })}
            renderItem={({ item: meta, index: i }) => {
              const itemH = Math.round(itemW * fractionOf(meta));
              const hasLabel = meta.alt && meta.alt !== `Image ${i + 1}`;
              return (
                <View style={{ width: itemW }}>
                  <BannerImage
                    meta={meta}
                    width={itemW}
                    height={itemH}
                    onPress={handlePress}
                    borderRadius={10}
                  />
                  {hasLabel ? (
                    <Text style={styles.itemCaption}>{meta.alt}</Text>
                  ) : null}
                </View>
              );
            }}
          />
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODE 2: scrollable — full-width paging carousel (e.g. hero banner)
  // ════════════════════════════════════════════════════════════════════════
  if (scrollable) {
    const sidePad = gap ? 10 : 0;
    const snapW = SCREEN_W - sidePad * 2;
    // Use the tallest slide ratio so no slide is clipped.
    const maxFraction = metas.reduce(
      (m, meta) => Math.max(m, fractionOf(meta)),
      0,
    );
    const slideH = Math.round(snapW * (maxFraction || ratioToFraction(defaultRatio)));

    return (
      <View style={[styles.section, { backgroundColor }]}>
        <Header />

        <FlatList
          ref={flatListRef}
          data={metas}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapW}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: sidePad }}
          getItemLayout={(_, index) => ({
            length: snapW,
            offset: snapW * index,
            index,
          })}
          onMomentumScrollEnd={e => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / snapW);
            setActiveIndex(idx);
            if (autoScroll) {
              clearInterval(timerRef.current);
              timerRef.current = setInterval(nextSlide, scrollInterval);
            }
          }}
          renderItem={({ item: meta }) => (
            <BannerImage
              meta={meta}
              width={snapW}
              height={slideH}
              onPress={handlePress}
              borderRadius={gap ? 12 : 0}
            />
          )}
        />

        {dots && totalSlides > 1 && (
          <View style={styles.dotsRow}>
            {metas.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODE 3: fixed mobileRows grid
  // ════════════════════════════════════════════════════════════════════════
  const parsedRows = (() => {
    if (!mobileRows) return null;
    if (Array.isArray(mobileRows)) return mobileRows;
    try {
      return JSON.parse(mobileRows);
    } catch {
      return null;
    }
  })();

  if (parsedRows && parsedRows.length > 0) {
    const spacing = wantGap ? 10 : 0;
    const radius = wantGap ? 10 : 0;
    let idx = 0;

    return (
      <View style={[styles.section, { backgroundColor }]}>
        <Header />
        <View style={{ paddingHorizontal: spacing }}>
          {parsedRows.map((cols, rowIdx) => {
            const rowMetas = metas.slice(idx, idx + cols);
            idx += cols;
            if (!rowMetas.length) return null;
            const itemW = (SCREEN_W - spacing * 2 - spacing * (cols - 1)) / cols;
            return (
              <View key={rowIdx} style={[styles.row, { marginBottom: spacing }]}>
                {rowMetas.map((meta, colIdx) => (
                  <View
                    key={colIdx}
                    style={{ marginRight: colIdx < cols - 1 ? spacing : 0 }}>
                    <BannerImage
                      meta={meta}
                      width={itemW}
                      height={Math.round(itemW * fractionOf(meta))}
                      onPress={handlePress}
                      borderRadius={radius}
                    />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // MODE 4: default grid with `visibleCount.mobile` columns
  // (Shop by Gender / Shop by Occasion / Offers — stacked full-width on mobile)
  // ════════════════════════════════════════════════════════════════════════
  const cols = mobileVisible;
  const spacing = wantGap ? 10 : 0;
  const radius = wantGap ? 12 : 0;
  const itemW = (SCREEN_W - spacing * 2 - spacing * (cols - 1)) / cols;

  // Chunk images into rows of `cols`.
  const rows = [];
  for (let i = 0; i < metas.length; i += cols) {
    rows.push(metas.slice(i, i + cols));
  }

  return (
    <View style={[styles.section, { backgroundColor }]}>
      <Header />
      <View style={{ paddingHorizontal: spacing }}>
        {rows.map((rowMetas, rowIdx) => (
          <View key={rowIdx} style={[styles.row, { marginBottom: spacing }]}>
            {rowMetas.map((meta, colIdx) => (
              <View
                key={colIdx}
                style={{ marginRight: colIdx < cols - 1 ? spacing : 0 }}>
                <BannerImage
                  meta={meta}
                  width={itemW}
                  height={Math.round(itemW * fractionOf(meta))}
                  onPress={handlePress}
                  borderRadius={radius}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default HeroBannerSection;

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  section: { marginVertical: 4, paddingVertical: 2 },

  sectionTitle: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 2,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  centeredText: { textAlign: 'center' },

  imgPlaceholder: {
    backgroundColor: colors.cardPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Arrows mode ──────────────────────────────────────────────────────────
  arrowsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  
    paddingBottom: 6,
  },
  arrowsTitleText: { flex: 1 },
  arrowsGroup: { flexDirection: 'row', alignItems: 'center' },

  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  arrowBtnActive: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
  arrowBtnDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  arrowBtnText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: fonts.weight.medium,
  },
  arrowBtnTextActive: { color: colors.white },
  arrowBtnTextDisabled: { color: colors.text },

  itemCaption: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: fonts.weight.medium,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── Dots ─────────────────────────────────────────────────────────────────
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
    borderRadius: 4,
  },

  // ── Grid rows (10px gap applied via margins when gap is true) ──
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});