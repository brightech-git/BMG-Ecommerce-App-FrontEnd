import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppSearchBarRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
}

export interface AppSearchBarProps
  extends Omit<TextInputProps, "style" | "onChangeText"> {
  /** Called (debounced) with the search query. */
  onSearch?: (query: string) => void;
  /** Called immediately on every keystroke. */
  onChangeText?: (text: string) => void;
  /** Debounce delay in ms (default 400). */
  debounceMs?: number;
  /** Controlled value. */
  value?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Show loading spinner. */
  loading?: boolean;
  /** Show clear button when there's text. */
  showClear?: boolean;
  /** Disable cancel / back affordance. */
  showCancel?: boolean;
  /** Label for the cancel button. */
  cancelLabel?: string;
  /** Called when cancel is pressed. */
  onCancel?: () => void;
  /** Filter / sort icon on the right — shows a dot badge when active. */
  onFilter?: () => void;
  /** Whether the filter is active (shows orange dot). */
  filterActive?: boolean;
  /** Result count badge label. */
  resultCount?: number;
  /** Disable the input. */
  disabled?: boolean;
  /** Variant: 'filled' | 'outlined' | 'minimal' */
  variant?: "filled" | "outlined" | "minimal";
  /** Show recent / suggestion chips below the bar. */
  suggestions?: string[];
  /** Called when a suggestion chip is tapped. */
  onSuggestionPress?: (suggestion: string) => void;
  /** Custom container style. */
  containerStyle?: ViewStyle;
  /** Custom input style. */
  inputStyle?: ViewStyle;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
  /** Voice search icon — called when pressed. */
  onVoiceSearch?: () => void;
}

// ─── Icons (inline SVG-style via Text — swap for your icon library) ──────────

const Icon = ({ name, color, size = 18 }: { name: string; color: string; size?: number }) => {
  const map: Record<string, string> = {
    search: "⌕",
    clear: "✕",
    filter: "⊟",
    mic: "🎙",
    back: "←",
  };
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
      {map[name] ?? "?"}
    </Text>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

const AppSearchBar = forwardRef<AppSearchBarRef, AppSearchBarProps>(
  (
    {
      onSearch,
      onChangeText,
      debounceMs = 400,
      value: controlledValue,
      placeholder = "Search…",
      loading = false,
      showClear = true,
      showCancel = true,
      cancelLabel = "Cancel",
      onCancel,
      onFilter,
      filterActive = false,
      resultCount,
      disabled = false,
      variant = "filled",
      suggestions = [],
      onSuggestionPress,
      containerStyle,
      inputStyle,
      autoFocus = false,
      onVoiceSearch,
      ...rest
    },
    ref
  ) => {
    const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

    const [query, setQuery] = useState(controlledValue ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cancelWidth = useRef(new Animated.Value(0)).current;
    const cancelOpacity = useRef(new Animated.Value(0)).current;

    // Sync controlled
    useEffect(() => {
      if (controlledValue !== undefined) setQuery(controlledValue);
    }, [controlledValue]);

    // Auto-focus
    useEffect(() => {
      if (autoFocus) {
        const t = setTimeout(() => inputRef.current?.focus(), 300);
        return () => clearTimeout(t);
      }
    }, [autoFocus]);

    // Debounce
    const handleChange = useCallback(
      (text: string) => {
        setQuery(text);
        onChangeText?.(text);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          onSearch?.(text.trim());
        }, debounceMs);
      },
      [onChangeText, onSearch, debounceMs]
    );

    // Cancel button animation
    useEffect(() => {
      if (isFocused && showCancel) {
        Animated.parallel([
          Animated.timing(cancelWidth, { toValue: 70, duration: 200, useNativeDriver: false }),
          Animated.timing(cancelOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(cancelWidth, { toValue: 0, duration: 180, useNativeDriver: false }),
          Animated.timing(cancelOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
        ]).start();
      }
    }, [isFocused, showCancel, cancelWidth, cancelOpacity]);

    const handleClear = useCallback(() => {
      setQuery("");
      onChangeText?.("");
      onSearch?.("");
      inputRef.current?.focus();
    }, [onChangeText, onSearch]);

    const handleCancel = useCallback(() => {
      Keyboard.dismiss();
      setQuery("");
      onChangeText?.("");
      setIsFocused(false);
      onCancel?.();
    }, [onCancel, onChangeText]);

    const handleSuggestion = useCallback(
      (s: string) => {
        setQuery(s);
        onSuggestionPress?.(s);
        onSearch?.(s);
      },
      [onSuggestionPress, onSearch]
    );

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: handleClear,
      getValue: () => query,
    }));

    // ── Style helpers ─────────────────────────────────────────────────────────

    const bgColor = () => {
      if (variant === "outlined") return COLORS.white;
      if (variant === "minimal") return "transparent";
      return COLORS.gray100;
    };

    const borderColor = () => {
      if (isFocused) return COLORS.primary;
      if (variant === "outlined") return COLORS.borderMedium;
      return "transparent";
    };

    const s = StyleSheet.create({
      wrapper: { width: "100%" },
      row: { flexDirection: "row", alignItems: "center", gap: 8 },
      bar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bgColor(),
        borderRadius: SIZES.radius.xl,
        borderWidth: variant === "minimal" ? 0 : 1.5,
        borderColor: borderColor(),
        paddingHorizontal: SIZES.padding.lg,
        paddingVertical: SIZES.padding.md,
        gap: 8,
        ...(variant === "filled" && isFocused ? SHADOWS.orange : SHADOWS.sm),
      },
      input: {
        flex: 1,
        ...FONTS.body,
        color: COLORS.textPrimary,
        padding: 0,
        margin: 0,
      },
      cancelBtn: {
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      },
      cancelText: { ...FONTS.bodyMedium, color: COLORS.primary },
      filterBtn: {
        width: 44,
        height: 44,
        borderRadius: SIZES.radius.md,
        backgroundColor: filterActive ? COLORS.primaryPale : COLORS.gray100,
        borderWidth: 1,
        borderColor: filterActive ? COLORS.primary : COLORS.borderLight,
        alignItems: "center",
        justifyContent: "center",
      },
      filterDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        borderWidth: 1.5,
        borderColor: COLORS.white,
      },
      countBadge: {
        backgroundColor: COLORS.primaryPale,
        borderRadius: SIZES.radius.full,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 4,
      },
      countText: { ...FONTS.caption, color: COLORS.primary },
      suggestionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
        paddingHorizontal: 4,
      },
      chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: COLORS.primaryPale,
        borderRadius: SIZES.radius.full,
        borderWidth: 1,
        borderColor: COLORS.primaryLighter,
      },
      chipText: { ...FONTS.caption, color: COLORS.primary },
    });

    return (
      <View style={[s.wrapper, containerStyle]}>
        <View style={s.row}>
          {/* Main bar */}
          <Pressable
            style={s.bar}
            onPress={() => inputRef.current?.focus()}
          >
            <Icon name="search" color={isFocused ? COLORS.primary : COLORS.textSecondary} size={18} />

            <TextInput
              ref={inputRef}
              style={[s.input, inputStyle as any]}
              value={query}
              onChangeText={handleChange}
              placeholder={placeholder}
              placeholderTextColor={COLORS.inputPlaceholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              editable={!disabled}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                onSearch?.(query.trim());
              }}
              {...rest}
            />

            {/* Result count */}
            {resultCount !== undefined && query.length > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{resultCount}</Text>
              </View>
            )}

            {/* Loading */}
            {loading && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}

            {/* Voice search */}
            {onVoiceSearch && !loading && !query && (
              <Pressable onPress={onVoiceSearch} hitSlop={8}>
                <Icon name="mic" color={COLORS.textSecondary} size={16} />
              </Pressable>
            )}

            {/* Clear */}
            {showClear && !!query && !loading && (
              <Pressable onPress={handleClear} hitSlop={8}>
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: COLORS.gray300,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="clear" color={COLORS.white} size={10} />
                </View>
              </Pressable>
            )}
          </Pressable>

          {/* Cancel button */}
          {showCancel && (
            <Animated.View
              style={[
                s.cancelBtn,
                { width: cancelWidth, opacity: cancelOpacity },
              ]}
            >
              <Pressable onPress={handleCancel}>
                <Text style={s.cancelText}>{cancelLabel}</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Filter button */}
          {onFilter && (
            <Pressable style={s.filterBtn} onPress={onFilter}>
              <Icon
                name="filter"
                color={filterActive ? COLORS.primary : COLORS.textSecondary}
                size={18}
              />
              {filterActive && <View style={s.filterDot} />}
            </Pressable>
          )}
        </View>

        {/* Suggestions */}
        {isFocused && suggestions.length > 0 && (
          <View style={s.suggestionsRow}>
            {suggestions.map((s_, i) => (
              <Pressable
                key={i}
                style={s.chip}
                onPress={() => handleSuggestion(s_)}
              >
                <Text style={s.chipText}>{s_}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }
);

AppSearchBar.displayName = "AppSearchBar";
export default AppSearchBar;

/*
<AppSearchBar
  placeholder="Search gold, ETFs, SIPs…"
  onSearch={(q) => fetchResults(q)}
  debounceMs={500}
  loading={isSearching}
  filterActive={hasFilters}
  onFilter={() => openFilterSheet()}
  suggestions={["Gold ETF", "SIP", "Digital Gold"]}
  onSuggestionPress={(s) => setQuery(s)}
  variant="filled"
  showCancel
/>
*/