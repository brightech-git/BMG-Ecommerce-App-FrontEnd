// components/AppLanguagePicker.tsx
//
// A full-featured language selector for Indian languages.
// Supports bottom-sheet picker, inline grid, and a minimal flag-chip row.
//
// ─── Install ──────────────────────────────────────────────────────
//   npx expo install expo-localization
//   npm install i18n-js   (optional — for actual i18n)
//
// ─── Usage ────────────────────────────────────────────────────────
//
//   // 1. Bottom-sheet picker (most common)
//   <AppLanguagePicker
//     visible={showLang}
//     onClose={() => setShowLang(false)}
//     selectedCode={lang}
//     onSelect={(code) => { setLang(code); setShowLang(false); }}
//   />
//
//   // 2. Inline grid on a Settings screen
//   <AppLanguagePicker
//     mode="inline"
//     selectedCode={lang}
//     onSelect={(code) => setLang(code)}
//   />
//
//   // 3. Compact chip row
//   <AppLanguagePicker
//     mode="chips"
//     selectedCode={lang}
//     onSelect={(code) => setLang(code)}
//   />
//
//   // 4. Filter to specific languages only
//   <AppLanguagePicker
//     visible={showLang}
//     onClose={() => setShowLang(false)}
//     selectedCode={lang}
//     onSelect={setLang}
//     allowedCodes={['en', 'hi', 'ta', 'te']}
//   />

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Modal, FlatList,
  TextInput, TouchableWithoutFeedback,
  PanResponder, ScrollView, ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

const { height: SH, width: SW } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// Language data  — 22 scheduled Indian languages + English
// ─────────────────────────────────────────────────────────────────
export type LanguageCode =
  | 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu'
  | 'bn' | 'pa' | 'or' | 'as' | 'ur' | 'sa' | 'ks' | 'sd'
  | 'ne' | 'kok' | 'mni' | 'doi' | 'sat' | 'mai' | 'bo';

export type Language = {
  code:       LanguageCode;
  name:       string;         // English name
  nativeName: string;         // Name in that script
  script:     string;         // Script name
  flag:        string;        // Emoji representing the region
  region:     string;         // State / region hint
  rtl?:       boolean;
};

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en',  name: 'English',    nativeName: 'English',       script: 'Latin',      flag: '🇬🇧', region: 'Pan India'        },
  { code: 'hi',  name: 'Hindi',      nativeName: 'हिंदी',          script: 'Devanagari', flag: '🇮🇳', region: 'North India'       },
  { code: 'ta',  name: 'Tamil',      nativeName: 'தமிழ்',           script: 'Tamil',      flag: '🏛️', region: 'Tamil Nadu'        },
  { code: 'te',  name: 'Telugu',     nativeName: 'తెలుగు',           script: 'Telugu',     flag: '🌿', region: 'Andhra / Telangana'},
  { code: 'kn',  name: 'Kannada',    nativeName: 'ಕನ್ನಡ',           script: 'Kannada',    flag: '🌻', region: 'Karnataka'         },
  { code: 'ml',  name: 'Malayalam',  nativeName: 'മലയാളം',          script: 'Malayalam',  flag: '🌴', region: 'Kerala'            },
  { code: 'mr',  name: 'Marathi',    nativeName: 'मराठी',           script: 'Devanagari', flag: '🦁', region: 'Maharashtra'        },
  { code: 'gu',  name: 'Gujarati',   nativeName: 'ગુજરાતી',          script: 'Gujarati',   flag: '💠', region: 'Gujarat'           },
  { code: 'bn',  name: 'Bengali',    nativeName: 'বাংলা',            script: 'Bengali',    flag: '🐯', region: 'West Bengal'       },
  { code: 'pa',  name: 'Punjabi',    nativeName: 'ਪੰਜਾਬੀ',           script: 'Gurmukhi',   flag: '🌾', region: 'Punjab'            },
  { code: 'or',  name: 'Odia',       nativeName: 'ଓଡ଼ିଆ',           script: 'Odia',       flag: '🛕', region: 'Odisha'            },
  { code: 'as',  name: 'Assamese',   nativeName: 'অসমীয়া',          script: 'Bengali',    flag: '🦏', region: 'Assam'             },
  { code: 'ur',  name: 'Urdu',       nativeName: 'اردو',             script: 'Nastaliq',   flag: '☪️', region: 'Pan India', rtl: true },
  { code: 'sa',  name: 'Sanskrit',   nativeName: 'संस्कृतम्',         script: 'Devanagari', flag: '🕉️', region: 'Classical'         },
  { code: 'ks',  name: 'Kashmiri',   nativeName: 'कॉशुर',            script: 'Devanagari', flag: '❄️', region: 'Kashmir'           },
  { code: 'sd',  name: 'Sindhi',     nativeName: 'سنڌي',             script: 'Arabic',     flag: '🏜️', region: 'Sindh', rtl: true  },
  { code: 'ne',  name: 'Nepali',     nativeName: 'नेपाली',           script: 'Devanagari', flag: '🏔️', region: 'Sikkim / Nepal'    },
  { code: 'kok', name: 'Konkani',    nativeName: 'कोंकणी',           script: 'Devanagari', flag: '🌊', region: 'Goa'               },
  { code: 'mni', name: 'Manipuri',   nativeName: 'মৈতৈলোন্',         script: 'Meitei',     flag: '🏹', region: 'Manipur'           },
  { code: 'doi', name: 'Dogri',      nativeName: 'डोगरी',            script: 'Devanagari', flag: '🦌', region: 'Jammu'             },
  { code: 'sat', name: 'Santali',    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',          script: 'Ol Chiki',   flag: '🌲', region: 'Jharkhand'         },
  { code: 'mai', name: 'Maithili',   nativeName: 'मैथिली',           script: 'Devanagari', flag: '🎋', region: 'Bihar'             },
  { code: 'bo',  name: 'Bodo',       nativeName: 'बड़ो',             script: 'Devanagari', flag: '🏕️', region: 'Assam'             },
];

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
export type PickerMode = 'sheet' | 'inline' | 'chips';

type Props = {
  selectedCode:  LanguageCode;
  onSelect:      (code: LanguageCode) => void;
  /** 'sheet' = bottom sheet modal (default), 'inline' = grid, 'chips' = horizontal scroll */
  mode?:         PickerMode;
  /** For mode='sheet' */
  visible?:      boolean;
  onClose?:      () => void;
  /** Filter list to specific codes */
  allowedCodes?: LanguageCode[];
  /** Show search bar (sheet/inline only) */
  searchable?:   boolean;
  title?:        string;
  style?:        ViewStyle;
};

// ─────────────────────────────────────────────────────────────────
// Single language row item
// ─────────────────────────────────────────────────────────────────
function LangRow({
  lang, selected, onPress,
}: {
  lang: Language;
  selected: boolean;
  onPress: () => void;
}) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgAnim, { toValue: selected ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [selected]);

  const bg = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', COLORS.primaryPale] });
  const border = bgAnim.interpolate({ inputRange: [0, 1], outputRange: ['transparent', COLORS.primaryLighter] });

  const onIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[
        styles.langRow,
        { backgroundColor: bg, borderColor: border, borderWidth: 1, transform: [{ scale }] },
      ]}>
        {/* Flag + script badge */}
        <View style={styles.langFlagWrap}>
          <Text style={styles.langFlag}>{lang.flag}</Text>
        </View>

        {/* Text block */}
        <View style={styles.langTextBlock}>
          <View style={styles.langNameRow}>
            <Text style={[styles.langName, {
              fontFamily: FONTS.family.semiBold,
              fontSize:   SIZES.font.md,
              color:      selected ? COLORS.primary : COLORS.textPrimary,
            }]}>
              {lang.name}
            </Text>
            {lang.rtl && (
              <View style={[styles.rtlBadge, { backgroundColor: COLORS.orangeOpacity10 }]}>
                <Text style={[styles.rtlText, { color: COLORS.primary, fontFamily: FONTS.family.bold, fontSize: SIZES.font.xxs }]}>RTL</Text>
              </View>
            )}
          </View>
          <Text style={[styles.langNative, {
            fontFamily: FONTS.family.regular,
            fontSize:   SIZES.font.sm,
            color:      selected ? COLORS.primaryLight : COLORS.textSecondary,
          }]}>
            {lang.nativeName}
          </Text>
          <Text style={[styles.langRegion, {
            fontFamily: FONTS.family.regular,
            fontSize:   SIZES.font.xs,
            color:      COLORS.textTertiary,
          }]}>
            {lang.script} · {lang.region}
          </Text>
        </View>

        {/* Selected tick */}
        <Animated.View style={[
          styles.tickCircle,
          {
            backgroundColor: selected ? COLORS.primary : 'transparent',
            borderColor:     selected ? COLORS.primary : COLORS.border,
          },
        ]}>
          {selected && <Ionicons name="checkmark" size={moderateScale(13)} color="#fff" />}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
// Inline grid card
// ─────────────────────────────────────────────────────────────────
function LangCard({
  lang, selected, onPress,
}: {
  lang: Language;
  selected: boolean;
  onPress: () => void;
}) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();
  const scale  = useRef(new Animated.Value(1)).current;
  const cardW  = (SW - 48) / 3;

  const onIn  = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[
        styles.langCard,
        {
          width:           cardW,
          backgroundColor: selected ? COLORS.primaryPale  : COLORS.white,
          borderColor:     selected ? COLORS.primary       : COLORS.border,
          transform:       [{ scale }],
          ...(selected ? SHADOWS.orange : SHADOWS.sm),
        },
      ]}>
        <Text style={styles.cardFlag}>{lang.flag}</Text>
        <Text style={[styles.cardNative, {
          fontFamily: FONTS.family.semiBold,
          fontSize:   SIZES.font.sm,
          color:      selected ? COLORS.primary : COLORS.textPrimary,
        }]} numberOfLines={1}>
          {lang.nativeName}
        </Text>
        <Text style={[styles.cardName, {
          fontFamily: FONTS.family.regular,
          fontSize:   SIZES.font.xs,
          color:      COLORS.textTertiary,
        }]} numberOfLines={1}>
          {lang.name}
        </Text>
        {selected && (
          <View style={[styles.cardTick, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="checkmark" size={10} color="#fff" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
// Chip (horizontal scroll)
// ─────────────────────────────────────────────────────────────────
function LangChip({
  lang, selected, onPress,
}: {
  lang: Language;
  selected: boolean;
  onPress: () => void;
}) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 24 }).start();

  return (
    <TouchableOpacity onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
      <Animated.View style={[
        styles.chip,
        {
          backgroundColor: selected ? COLORS.primary      : COLORS.white,
          borderColor:     selected ? COLORS.primary       : COLORS.border,
          transform:       [{ scale }],
          ...(selected ? SHADOWS.orange : {}),
        },
      ]}>
        <Text style={styles.chipFlag}>{lang.flag}</Text>
        <Text style={[styles.chipLabel, {
          fontFamily: FONTS.family.semiBold,
          fontSize:   SIZES.font.xs,
          color:      selected ? COLORS.white : COLORS.textPrimary,
        }]}>
          {lang.name}
        </Text>
        <Text style={[styles.chipNative, {
          fontFamily: FONTS.family.regular,
          fontSize:   SIZES.font.xs,
          color:      selected ? 'rgba(255,255,255,0.75)' : COLORS.textTertiary,
        }]}>
          {lang.nativeName}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
// Search bar
// ─────────────────────────────────────────────────────────────────
function SearchBar({
  value, onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  const { COLORS, FONTS, SIZES, moderateScale } = useTheme();
  return (
    <View style={[styles.searchWrap, { backgroundColor: COLORS.gray100, borderColor: COLORS.border }]}>
      <Ionicons name="search-outline" size={moderateScale(16)} color={COLORS.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search language…"
        placeholderTextColor={COLORS.textTertiary}
        style={[styles.searchInput, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.sm, color: COLORS.textPrimary }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={moderateScale(16)} color={COLORS.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// AppLanguagePicker — main component
// ─────────────────────────────────────────────────────────────────
export default function AppLanguagePicker({
  selectedCode, onSelect,
  mode = 'sheet',
  visible = false, onClose,
  allowedCodes, searchable = true,
  title = 'Select Language',
  style,
}: Props) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();

  const [query, setQuery] = useState('');

  const langs = (allowedCodes
    ? INDIAN_LANGUAGES.filter(l => allowedCodes.includes(l.code))
    : INDIAN_LANGUAGES
  ).filter(l =>
    query.length === 0 ||
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(query.toLowerCase()) ||
    l.region.toLowerCase().includes(query.toLowerCase()) ||
    l.script.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLang = INDIAN_LANGUAGES.find(l => l.code === selectedCode);

  // ── Sheet animation ──────────────────────────
  const translateY = useRef(new Animated.Value(SH)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const dragY      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mode !== 'sheet') return;
    if (visible) {
      setQuery('');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 180 }),
        Animated.timing(backdropOp, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SH, duration: 240, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0,  duration: 200, useNativeDriver: true }),
      ]).start(() => dragY.setValue(0));
    }
  }, [visible, mode]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 6,
    onPanResponderMove:    (_, g) => { if (g.dy > 0) dragY.setValue(g.dy); },
    onPanResponderRelease: (_, g) => {
      if (g.dy > 100 || g.vy > 0.6) onClose?.();
      else Animated.spring(dragY, { toValue: 0, useNativeDriver: true, damping: 18 }).start();
    },
  })).current;

  const combinedY = Animated.add(translateY, dragY);

  const handleSelect = useCallback((code: LanguageCode) => {
    onSelect(code);
    if (mode === 'sheet') onClose?.();
  }, [onSelect, onClose, mode]);

  // ─────────────────────────────────────────────
  // CHIPS mode
  // ─────────────────────────────────────────────
  if (mode === 'chips') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsRow, style]}
      >
        {langs.map(lang => (
          <LangChip
            key={lang.code}
            lang={lang}
            selected={lang.code === selectedCode}
            onPress={() => handleSelect(lang.code)}
          />
        ))}
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────
  // INLINE grid mode
  // ─────────────────────────────────────────────
  if (mode === 'inline') {
    return (
      <View style={style}>
        {searchable && (
          <View style={{ paddingHorizontal: 0, marginBottom: 14 }}>
            <SearchBar value={query} onChange={setQuery} />
          </View>
        )}
        <View style={styles.grid}>
          {langs.map(lang => (
            <LangCard
              key={lang.code}
              lang={lang}
              selected={lang.code === selectedCode}
              onPress={() => handleSelect(lang.code)}
            />
          ))}
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // SHEET mode (default)
  // ─────────────────────────────────────────────
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.sheet, { backgroundColor: COLORS.white, transform: [{ translateY: combinedY }], ...SHADOWS.xl }]}
        {...pan.panHandlers}
      >
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: COLORS.gray300 }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={[styles.headerIcon, { backgroundColor: COLORS.primaryPale }]}>
            <Text style={{ fontSize: 22 }}>🌐</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.sheetTitle, { fontFamily: FONTS.family.bold, fontSize: SIZES.font.xl, color: COLORS.textPrimary }]}>
              {title}
            </Text>
            {selectedLang && (
              <Text style={[{ fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
                Current: {selectedLang.flag}  {selectedLang.name} ({selectedLang.nativeName})
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: COLORS.gray100 }]}>
            <Ionicons name="close" size={moderateScale(18)} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        {searchable && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <SearchBar value={query} onChange={setQuery} />
          </View>
        )}

        {/* Language count */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
          <Text style={[{ fontFamily: FONTS.family.regular, fontSize: SIZES.font.xs, color: COLORS.textTertiary }]}>
            {langs.length} language{langs.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: COLORS.borderLight }]} />

        {/* List */}
        <FlatList
          data={langs}
          keyExtractor={l => l.code}
          extraData={selectedCode}
          renderItem={({ item }) => (
            <LangRow
              lang={item}
              selected={item.code === selectedCode}
              onPress={() => handleSelect(item.code)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Sheet
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: SH * 0.88,
    paddingBottom: 24, overflow: 'hidden',
  },
  handle:      { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sheetTitle:  {},
  closeBtn:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  divider:     { height: StyleSheet.hairlineWidth },

  // Lang row
  langRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, gap: 12,
  },
  langFlagWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.04)' },
  langFlag:     { fontSize: 22 },
  langTextBlock:{ flex: 1 },
  langNameRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  langName:     {},
  langNative:   {},
  langRegion:   { marginTop: 1 },
  rtlBadge:     { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  rtlText:      {},
  tickCircle:   { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

  // Lang card (grid)
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langCard: {
    borderRadius: 16, borderWidth: 1.5,
    padding: 12, alignItems: 'center', gap: 4,
    position: 'relative',
  },
  cardFlag:   { fontSize: 26 },
  cardNative: { textAlign: 'center' },
  cardName:   { textAlign: 'center' },
  cardTick:   { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  // Chips
  chipsRow:   { gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1.5,
  },
  chipFlag:   { fontSize: 16 },
  chipLabel:  {},
  chipNative: {},

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, padding: 0 },
});