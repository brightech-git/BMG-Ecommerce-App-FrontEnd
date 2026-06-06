import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  Pressable,
  Vibration,
} from "react-native";
import { useTheme } from "../../../theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppPinInputRef {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

export interface AppPinInputProps {
  /** Number of PIN digits (default 4). */
  length?: number;
  /** Called on each change. */
  onChangeText?: (pin: string) => void;
  /** Called when all digits are entered. */
  onComplete?: (pin: string) => void;
  /** Error state — shakes & colors dots red. */
  error?: boolean;
  /** Success state — colors dots green. */
  success?: boolean;
  /** Disable all input. */
  disabled?: boolean;
  /** Display style: 'dots' | 'boxes'. */
  variant?: "dots" | "boxes";
  /** Label above the input. */
  label?: string;
  /** Subtitle / hint text. */
  hint?: string;
  /** Error message shown below. */
  errorMessage?: string;
  /** Auto-focus on mount. */
  autoFocus?: boolean;
  /** Dot / box size in px. */
  dotSize?: number;
  /** Gap between dots / boxes. */
  gap?: number;
  /** Vibrate on wrong pin (requires error flipping to true). */
  vibrateOnError?: boolean;
  /** Custom container style. */
  containerStyle?: ViewStyle;
  /** Show a numeric keypad below instead of native keyboard. */
  showKeypad?: boolean;
}

// ─── Custom Keypad ────────────────────────────────────────────────────────────

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

interface KeypadProps {
  onPress: (key: string) => void;
  disabled?: boolean;
}

const Keypad: React.FC<KeypadProps> = ({ onPress, disabled }) => {
  const { COLORS, FONTS, SIZES } = useTheme();

  const s = StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: 240,
      gap: 12,
      justifyContent: "center",
      marginTop: 24,
    },
    key: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: COLORS.gray100,
      alignItems: "center",
      justifyContent: "center",
    },
    keyText: { ...FONTS.h4, color: COLORS.textPrimary },
    deleteText: { ...FONTS.h4, color: COLORS.primary },
    emptyKey: { width: 68, height: 68, backgroundColor: "transparent" },
  });

  return (
    <View style={s.grid}>
      {KEYS.map((k, i) => {
        if (k === "") return <View key={i} style={s.emptyKey} />;
        return (
          <Pressable
            key={i}
            onPress={() => !disabled && onPress(k)}
            style={({ pressed }) => [
              s.key,
              { opacity: pressed ? 0.6 : 1 },
              k === "⌫" && { backgroundColor: "transparent" },
            ]}
          >
            <Text style={k === "⌫" ? s.deleteText : s.keyText}>{k}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

const AppPinInput = forwardRef<AppPinInputRef, AppPinInputProps>(
  (
    {
      length = 4,
      onChangeText,
      onComplete,
      error = false,
      success = false,
      disabled = false,
      variant = "dots",
      label,
      hint,
      errorMessage,
      autoFocus = false,
      dotSize,
      gap,
      vibrateOnError = true,
      containerStyle,
      showKeypad = false,
    },
    ref
  ) => {
    const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

    const DOT = dotSize ?? (variant === "dots" ? 18 : 52);
    const GAP = gap ?? (variant === "dots" ? 20 : 10);

    const [pin, setPin] = useState<string[]>(Array(length).fill(""));
    const [focused, setFocused] = useState(false);
    const hiddenRef = useRef<TextInput>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const dotAnims = useRef(
      Array(length)
        .fill(null)
        .map(() => new Animated.Value(0))
    ).current;

    // Shake + vibrate on error
    useEffect(() => {
      if (!error) return;
      if (vibrateOnError) Vibration.vibrate(300);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }, [error, shakeAnim, vibrateOnError]);

    const animateDot = useCallback(
      (index: number, filled: boolean) => {
        Animated.spring(dotAnims[index], {
          toValue: filled ? 1 : 0,
          useNativeDriver: true,
          bounciness: 10,
          speed: 20,
        }).start();
      },
      [dotAnims]
    );

    useEffect(() => {
      if (autoFocus && !showKeypad) {
        const t = setTimeout(() => hiddenRef.current?.focus(), 300);
        return () => clearTimeout(t);
      }
    }, [autoFocus, showKeypad]);

    // ── Internal update ───────────────────────────────────────────────────────

    const updatePin = useCallback(
      (next: string[]) => {
        setPin(next);
        const str = next.join("");
        onChangeText?.(str);
        if (!next.includes("") && str.length === length) {
          onComplete?.(str);
        }
      },
      [length, onChangeText, onComplete]
    );

    // ── Native keyboard handler ───────────────────────────────────────────────

    const handleNativeChange = useCallback(
      (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, length);
        const next = Array(length).fill("");
        digits.split("").forEach((d, i) => {
          next[i] = d;
          animateDot(i, true);
        });
        // clear removed
        for (let i = digits.length; i < length; i++) {
          animateDot(i, false);
        }
        updatePin(next);
      },
      [length, animateDot, updatePin]
    );

    // ── Custom keypad handler ─────────────────────────────────────────────────

    const handleKeypadPress = useCallback(
      (key: string) => {
        if (key === "⌫") {
          const lastFilled = pin.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
          if (lastFilled.length === 0) return;
          const idx = lastFilled[lastFilled.length - 1];
          const next = [...pin];
          next[idx] = "";
          animateDot(idx, false);
          updatePin(next);
        } else {
          const firstEmpty = pin.findIndex((d) => !d);
          if (firstEmpty === -1) return;
          const next = [...pin];
          next[firstEmpty] = key;
          animateDot(firstEmpty, true);
          updatePin(next);
        }
      },
      [pin, animateDot, updatePin]
    );

    useImperativeHandle(ref, () => ({
      focus: () => hiddenRef.current?.focus(),
      clear: () => {
        const next = Array(length).fill("");
        setPin(next);
        dotAnims.forEach((a) => a.setValue(0));
        onChangeText?.("");
      },
      getValue: () => pin.join(""),
    }));

    // ── Dot color ─────────────────────────────────────────────────────────────

    const dotFillColor = (index: number) => {
      if (error) return COLORS.error;
      if (success && pin[index]) return COLORS.success;
      if (pin[index]) return COLORS.primary;
      return "transparent";
    };

    const dotBorderColor = (index: number) => {
      if (error) return COLORS.error;
      if (success && pin[index]) return COLORS.success;
      if (focused && pin.filter(Boolean).length === index) return COLORS.primary;
      if (pin[index]) return COLORS.primaryDark;
      return COLORS.borderMedium;
    };

    // ── Styles ────────────────────────────────────────────────────────────────

    const s = StyleSheet.create({
      container: { alignItems: "center" },
      label: { ...FONTS.label, color: COLORS.textPrimary, marginBottom: 4 },
      hint: {
        ...FONTS.bodySmall,
        color: COLORS.textSecondary,
        marginBottom: 16,
        textAlign: "center",
      },
      row: { flexDirection: "row", alignItems: "center", gap: GAP },
      dot: {
        width: DOT,
        height: DOT,
        borderRadius: DOT / 2,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },
      dotInner: {
        width: DOT - 8,
        height: DOT - 8,
        borderRadius: (DOT - 8) / 2,
      },
      box: {
        width: DOT,
        height: DOT,
        borderRadius: SIZES.radius.md,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.gray50,
        ...SHADOWS.sm,
      },
      boxText: { ...FONTS.h4, color: COLORS.textPrimary },
      hiddenInput: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
      },
      errorMsg: {
        ...FONTS.caption,
        color: COLORS.error,
        marginTop: 10,
        textAlign: "center",
      },
      tapArea: { padding: 12 },
    });

    return (
      <View style={[s.container, containerStyle]}>
        {label && <Text style={s.label}>{label}</Text>}
        {hint && <Text style={s.hint}>{hint}</Text>}

        <Pressable
          style={s.tapArea}
          onPress={() => !showKeypad && hiddenRef.current?.focus()}
        >
          <Animated.View
            style={[s.row, { transform: [{ translateX: shakeAnim }] }]}
          >
            {pin.map((digit, i) => {
              if (variant === "dots") {
                return (
                  <View
                    key={i}
                    style={[
                      s.dot,
                      {
                        borderColor: dotBorderColor(i),
                        backgroundColor: COLORS.gray50,
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        s.dotInner,
                        {
                          backgroundColor: dotFillColor(i),
                          transform: [
                            {
                              scale: dotAnims[i].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 1],
                              }),
                            },
                          ],
                          opacity: dotAnims[i],
                        },
                      ]}
                    />
                  </View>
                );
              }

              // boxes variant
              return (
                <View
                  key={i}
                  style={[
                    s.box,
                    {
                      borderColor: dotBorderColor(i),
                      backgroundColor:
                        error && digit
                          ? COLORS.errorLight + "22"
                          : success && digit
                          ? COLORS.success + "22"
                          : digit
                          ? COLORS.primaryPale
                          : COLORS.gray50,
                    },
                  ]}
                >
                  <Animated.Text
                    style={[
                      s.boxText,
                      {
                        color: error
                          ? COLORS.error
                          : success
                          ? COLORS.success
                          : COLORS.textPrimary,
                        transform: [{ scale: dotAnims[i] }],
                        opacity: dotAnims[i],
                      },
                    ]}
                  >
                    {digit ? "●" : ""}
                  </Animated.Text>
                </View>
              );
            })}
          </Animated.View>
        </Pressable>

        {/* Hidden native input */}
        {!showKeypad && (
          <TextInput
            ref={hiddenRef}
            style={s.hiddenInput}
            value={pin.join("")}
            onChangeText={handleNativeChange}
            keyboardType="number-pad"
            maxLength={length}
            editable={!disabled}
            caretHidden
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={false}
          />
        )}

        {/* Custom keypad */}
        {showKeypad && (
          <Keypad onPress={handleKeypadPress} disabled={disabled} />
        )}

        {error && errorMessage && (
          <Text style={s.errorMsg}>{errorMessage}</Text>
        )}
      </View>
    );
  }
);

AppPinInput.displayName = "AppPinInput";
export default AppPinInput;

/*
<AppPinInput
  length={4}
  variant="dots"          // or "boxes"
  showKeypad              // renders built-in numeric keypad
  label="Enter your PIN"
  hint="Use the PIN you set during registration"
  onComplete={(pin) => verifyPin(pin)}
  error={pinError}
  errorMessage="Incorrect PIN. Try again."
  vibrateOnError
/>
*/