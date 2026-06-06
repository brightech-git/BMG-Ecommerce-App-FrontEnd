import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  forwardRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { useTheme } from "../../../theme"; // adjust path as needed

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================
// TYPES
// ============================================================
export type SnapPoint = "25%" | "50%" | "75%" | "90%" | number;

export interface AppBottomSheetRef {
  open: () => void;
  close: () => void;
  snapTo: (index: number) => void;
}

export interface AppBottomSheetProps {
  /** Array of snap points — strings like "50%" or pixel numbers */
  snapPoints?: SnapPoint[];
  /** Initial snap index (0 = first/smallest) */
  initialSnapIndex?: number;
  /** Sheet title shown in handle area */
  title?: string;
  /** Subtitle below title */
  subtitle?: string;
  /** Whether backdrop tap closes the sheet */
  closeOnBackdropPress?: boolean;
  /** Whether to show the drag handle indicator */
  showHandle?: boolean;
  /** Whether to show a close button in header */
  showCloseButton?: boolean;
  /** Background color of the sheet */
  backgroundColor?: string;
  /** Whether content is scrollable */
  scrollable?: boolean;
  /** Called when sheet fully closes */
  onClose?: () => void;
  /** Called when sheet opens */
  onOpen?: () => void;
  /** Called when snap point changes */
  onSnapChange?: (index: number) => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Custom header component (replaces title/subtitle) */
  headerComponent?: React.ReactNode;
  /** Footer component pinned above keyboard */
  footerComponent?: React.ReactNode;
  /** Enable keyboard avoiding */
  keyboardAvoiding?: boolean;
  /** Style for content container */
  contentContainerStyle?: object;
}

// ============================================================
// HELPERS
// ============================================================
function resolveSnapPoint(snap: SnapPoint): number {
  if (typeof snap === "number") return snap;
  const pct = parseFloat(snap) / 100;
  return SCREEN_HEIGHT * pct;
}

// ============================================================
// COMPONENT
// ============================================================
const AppBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  (
    {
      snapPoints = ["50%", "90%"],
      initialSnapIndex = 0,
      title,
      subtitle,
      closeOnBackdropPress = true,
      showHandle = true,
      showCloseButton = false,
      backgroundColor,
      scrollable = true,
      onClose,
      onOpen,
      onSnapChange,
      children,
      headerComponent,
      footerComponent,
      keyboardAvoiding = true,
      contentContainerStyle,
    },
    ref
  ) => {
    const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

    const [visible, setVisible] = React.useState(false);
    const [currentSnapIndex, setCurrentSnapIndex] = React.useState(initialSnapIndex);

    const resolvedSnaps = snapPoints.map(resolveSnapPoint);
    // Sort ascending so index 0 = smallest
    const sortedSnaps = [...resolvedSnaps].sort((a, b) => a - b);

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const lastGestureY = useRef(0);

    const currentHeight = sortedSnaps[currentSnapIndex] ?? sortedSnaps[0];

    // ---- Animations ----
    const animateTo = useCallback(
      (toValue: number, duration = 300) => {
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - toValue,
          useNativeDriver: true,
          damping: 18,
          stiffness: 150,
          mass: 1,
        }).start();
      },
      [translateY]
    );

    const open = useCallback(() => {
      setVisible(true);
      const snapHeight = sortedSnaps[initialSnapIndex] ?? sortedSnaps[0];
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: SCREEN_HEIGHT - snapHeight,
          useNativeDriver: true,
          damping: 18,
          stiffness: 140,
          mass: 1,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onOpen?.());
    }, [sortedSnaps, initialSnapIndex, translateY, backdropOpacity, onOpen]);

    const close = useCallback(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onClose?.();
      });
    }, [translateY, backdropOpacity, onClose]);

    const snapTo = useCallback(
      (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, sortedSnaps.length - 1));
        setCurrentSnapIndex(clampedIndex);
        animateTo(sortedSnaps[clampedIndex]);
        onSnapChange?.(clampedIndex);
      },
      [sortedSnaps, animateTo, onSnapChange]
    );

    // Expose ref methods
    useImperativeHandle(ref, () => ({ open, close, snapTo }), [open, close, snapTo]);

    // ---- Pan Responder ----
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
        onPanResponderGrant: () => {
          lastGestureY.current = 0;
        },
        onPanResponderMove: (_, gs) => {
          const newY = SCREEN_HEIGHT - currentHeight + gs.dy;
          if (newY > 0) translateY.setValue(newY);
        },
        onPanResponderRelease: (_, gs) => {
          const velocity = gs.vy;
          const draggedDown = gs.dy > 60 || velocity > 0.5;
          const draggedUp = gs.dy < -60 || velocity < -0.5;

          if (draggedDown) {
            // Try snapping to smaller or closing
            if (currentSnapIndex === 0) {
              close();
            } else {
              snapTo(currentSnapIndex - 1);
            }
          } else if (draggedUp) {
            // Try snapping to larger
            if (currentSnapIndex < sortedSnaps.length - 1) {
              snapTo(currentSnapIndex + 1);
            } else {
              animateTo(sortedSnaps[currentSnapIndex]);
            }
          } else {
            // Snap back to current
            animateTo(sortedSnaps[currentSnapIndex]);
          }
        },
      })
    ).current;

    const styles = StyleSheet.create({
      modalOverlay: {
        flex: 1,
      },
      backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
      },
      sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: backgroundColor ?? COLORS.white,
        borderTopLeftRadius: SIZES.radius.xxl,
        borderTopRightRadius: SIZES.radius.xxl,
        ...SHADOWS.xl,
        overflow: "hidden",
      },
      handleArea: {
        alignItems: "center",
        paddingTop: SIZES.padding.md,
        paddingBottom: SIZES.padding.sm,
      },
      handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.gray300,
      },
      header: {
        paddingHorizontal: SIZES.padding.xxl,
        paddingBottom: SIZES.padding.md,
        borderBottomWidth: visible && (title || subtitle || headerComponent) ? 1 : 0,
        borderBottomColor: COLORS.borderLight,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      headerText: {
        flex: 1,
      },
      titleText: {
        ...FONTS.h4,
        color: COLORS.textPrimary,
      },
      subtitleText: {
        ...FONTS.bodySmall,
        color: COLORS.textSecondary,
        marginTop: 2,
      },
      closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.gray100,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: SIZES.padding.md,
      },
      closeBtnText: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: "600",
      },
      content: {
        flex: 1,
      },
      contentScroll: {
        flexGrow: 1,
        paddingHorizontal: SIZES.padding.xxl,
        paddingTop: SIZES.padding.md,
        paddingBottom: SIZES.padding.xxxl,
      },
      contentStatic: {
        flex: 1,
        paddingHorizontal: SIZES.padding.xxl,
        paddingTop: SIZES.padding.md,
      },
      footer: {
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        paddingHorizontal: SIZES.padding.xxl,
        paddingTop: SIZES.padding.md,
        paddingBottom: Platform.OS === "ios" ? SIZES.padding.xl : SIZES.padding.md,
        backgroundColor: backgroundColor ?? COLORS.white,
      },
      snapDots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        paddingBottom: SIZES.padding.sm,
      },
      snapDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
      },
    });

    if (!visible) return null;

    const ContentWrapper = keyboardAvoiding ? KeyboardAvoidingView : View;
    const kwProps = keyboardAvoiding
      ? { behavior: Platform.OS === "ios" ? ("padding" as const) : undefined, style: { flex: 1 } }
      : { style: { flex: 1 } };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={closeOnBackdropPress ? close : undefined}
          >
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
          </TouchableWithoutFeedback>

          {/* Sheet */}
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <ContentWrapper {...kwProps}>
              {/* Drag Handle */}
              {showHandle && (
                <View style={styles.handleArea} {...panResponder.panHandlers}>
                  <View style={styles.handle} />
                  {/* Snap dots indicator */}
                  {sortedSnaps.length > 1 && (
                    <View style={[styles.snapDots, { marginTop: 8 }]}>
                      {sortedSnaps.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.snapDot,
                            {
                              backgroundColor:
                                i === currentSnapIndex
                                  ? COLORS.primary
                                  : COLORS.gray200,
                              width: i === currentSnapIndex ? 16 : 6,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Header */}
              {(title || subtitle || headerComponent || showCloseButton) && (
                <View style={styles.header}>
                  {headerComponent ? (
                    headerComponent
                  ) : (
                    <View style={styles.headerText}>
                      {title && <Text style={styles.titleText}>{title}</Text>}
                      {subtitle && (
                        <Text style={styles.subtitleText}>{subtitle}</Text>
                      )}
                    </View>
                  )}
                  {showCloseButton && (
                    <View
                      style={styles.closeBtn}
                      // @ts-ignore
                      onTouchEnd={close}
                    >
                      <Text style={styles.closeBtnText}>✕</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {scrollable ? (
                  <ScrollView
                    contentContainerStyle={[
                      styles.contentScroll,
                      contentContainerStyle,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {children}
                  </ScrollView>
                ) : (
                  <View style={[styles.contentStatic, contentContainerStyle]}>
                    {children}
                  </View>
                )}
              </View>

              {/* Footer */}
              {footerComponent && (
                <View style={styles.footer}>{footerComponent}</View>
              )}
            </ContentWrapper>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

AppBottomSheet.displayName = "AppBottomSheet";
export default AppBottomSheet;

// ============================================================
// USAGE EXAMPLE
// ============================================================
/*
const sheetRef = useRef<AppBottomSheetRef>(null);

<AppBottomSheet
  ref={sheetRef}
  snapPoints={["40%", "75%"]}
  title="Quick Buy"
  subtitle="Select amount and confirm"
  showCloseButton
  footerComponent={<AppButton title="Confirm" onPress={() => {}} />}
  onClose={() => console.log("closed")}
>
  <YourFormContent />
</AppBottomSheet>

// Open / close:
sheetRef.current?.open();
sheetRef.current?.close();
sheetRef.current?.snapTo(1); // snap to 75%
*/