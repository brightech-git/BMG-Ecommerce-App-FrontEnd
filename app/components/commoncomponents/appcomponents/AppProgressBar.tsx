import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../theme";

// ============================================================
// TYPES
// ============================================================

export type ProgressBarVariant = "default" | "striped" | "gradient" | "segmented";
export type ProgressBarSize = "xs" | "sm" | "md" | "lg";

export interface AppProgressBarProps {
  /** 0–100 */
  progress: number;
  /** Visual style */
  variant?: ProgressBarVariant;
  /** Bar height */
  size?: ProgressBarSize;
  /** Show percentage label */
  showLabel?: boolean;
  /** Label position */
  labelPosition?: "inside" | "outside-right" | "outside-top";
  /** Custom label string (overrides auto %) */
  label?: string;
  /** Filled bar color */
  color?: string;
  /** Track background color */
  trackColor?: string;
  /** Animate on mount */
  animated?: boolean;
  /** Animation duration ms */
  animationDuration?: number;
  /** Border radius override */
  borderRadius?: number;
  /** Show start/end value labels */
  showRange?: boolean;
  /** Start label */
  rangeStart?: string;
  /** End label */
  rangeEnd?: string;
  /** Additional container style */
  style?: object;
}

export type StepStatus = "completed" | "active" | "upcoming" | "error";

export interface ProgressStep {
  /** Step label */
  label: string;
  /** Optional short description */
  description?: string;
  /** Override auto-computed status */
  status?: StepStatus;
  /** Custom icon (emoji or string) */
  icon?: string;
}

export type StepOrientation = "horizontal" | "vertical";
export type StepVariant = "circles" | "dots" | "numbered" | "checkmarks";

export interface AppProgressStepsProps {
  steps: ProgressStep[];
  /** 0-based current step index */
  currentStep: number;
  /** Layout direction */
  orientation?: StepOrientation;
  /** Visual style of step indicators */
  variant?: StepVariant;
  /** Allow tapping steps to navigate */
  onStepPress?: (index: number) => void;
  /** Active color */
  activeColor?: string;
  /** Completed color */
  completedColor?: string;
  /** Error color */
  errorColor?: string;
  /** Connector line style */
  connectorStyle?: "solid" | "dashed" | "dotted";
  /** Show step descriptions */
  showDescriptions?: boolean;
  /** Animate transitions */
  animated?: boolean;
  style?: object;
}

// ============================================================
// SIZE MAP
// ============================================================
const BAR_HEIGHTS: Record<ProgressBarSize, number> = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
};

// ============================================================
// APP PROGRESS BAR
// ============================================================
export const AppProgressBar: React.FC<AppProgressBarProps> = ({
  progress,
  variant = "default",
  size = "md",
  showLabel = false,
  labelPosition = "outside-right",
  label,
  color,
  trackColor,
  animated = true,
  animationDuration = 600,
  borderRadius,
  showRange = false,
  rangeStart = "0",
  rangeEnd = "100",
  style,
}) => {
  const { COLORS, FONTS, SIZES } = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const barColor = color ?? COLORS.primary;
  const trackBg = trackColor ?? COLORS.gray100;
  const barHeight = BAR_HEIGHTS[size];
  const radius = borderRadius ?? barHeight / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: clampedProgress,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationDuration]);

  // Shimmer loop for striped variant
  useEffect(() => {
    if (variant === "striped") {
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [variant]);

  const widthPercent = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const displayLabel = label ?? `${Math.round(clampedProgress)}%`;

  const styles = StyleSheet.create({
    container: {
      width: "100%",
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    labelTop: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
    },
    rangeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    rangeText: {
      ...FONTS.caption,
      color: COLORS.textTertiary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: SIZES.sm,
    },
    track: {
      flex: 1,
      height: barHeight,
      backgroundColor: trackBg,
      borderRadius: radius,
      overflow: "hidden",
    },
    fill: {
      height: "100%",
      backgroundColor: barColor,
      borderRadius: radius,
    },
    labelRight: {
      ...FONTS.caption,
      color: COLORS.textSecondary,
      minWidth: 36,
      textAlign: "right",
    },
    insideLabel: {
      ...FONTS.caption,
      color: COLORS.white,
      paddingHorizontal: 6,
      fontSize: 9,
    },
    segmentTrack: {
      flexDirection: "row",
      gap: 3,
      flex: 1,
    },
    segment: {
      flex: 1,
      height: barHeight,
      borderRadius: radius,
    },
  });

  // Segmented variant
  if (variant === "segmented") {
    const totalSegments = 10;
    const filledCount = Math.round((clampedProgress / 100) * totalSegments);
    return (
      <View style={[styles.container, style]}>
        {showLabel && labelPosition === "outside-top" && (
          <View style={styles.topRow}>
            <Text style={styles.labelTop}>{displayLabel}</Text>
          </View>
        )}
        <View style={styles.row}>
          <View style={styles.segmentTrack}>
            {Array.from({ length: totalSegments }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.segment,
                  { backgroundColor: i < filledCount ? barColor : trackBg },
                ]}
              />
            ))}
          </View>
          {showLabel && labelPosition === "outside-right" && (
            <Text style={styles.labelRight}>{displayLabel}</Text>
          )}
        </View>
        {showRange && (
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>{rangeStart}</Text>
            <Text style={styles.rangeText}>{rangeEnd}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showLabel && labelPosition === "outside-top" && (
        <View style={styles.topRow}>
          <Text style={styles.labelTop}>{displayLabel}</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: widthPercent }]}>
            {showLabel && labelPosition === "inside" && barHeight >= 14 && (
              <Text style={styles.insideLabel}>{displayLabel}</Text>
            )}
          </Animated.View>
        </View>
        {showLabel && labelPosition === "outside-right" && (
          <Text style={styles.labelRight}>{displayLabel}</Text>
        )}
      </View>
      {showRange && (
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>{rangeStart}</Text>
          <Text style={styles.rangeText}>{rangeEnd}</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================
// APP PROGRESS STEPS
// ============================================================
export const AppProgressSteps: React.FC<AppProgressStepsProps> = ({
  steps,
  currentStep,
  orientation = "horizontal",
  variant = "numbered",
  onStepPress,
  activeColor,
  completedColor,
  errorColor,
  connectorStyle = "solid",
  showDescriptions = false,
  animated = true,
  style,
}) => {
  const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

  const activeC = activeColor ?? COLORS.primary;
  const completedC = completedColor ?? COLORS.success;
  const errorC = errorColor ?? COLORS.error;

  const scaleAnims = useRef(
    steps.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(scaleAnims[currentStep], {
        toValue: 1.1,
        useNativeDriver: true,
        damping: 10,
        stiffness: 100,
      }).start(() => {
        Animated.spring(scaleAnims[currentStep], {
          toValue: 1,
          useNativeDriver: true,
          damping: 10,
        }).start();
      });
    }
  }, [currentStep]);

  const getStatus = (index: number, step: ProgressStep): StepStatus => {
    if (step.status) return step.status;
    if (index < currentStep) return "completed";
    if (index === currentStep) return "active";
    return "upcoming";
  };

  const getStepColor = (status: StepStatus) => {
    switch (status) {
      case "completed": return completedC;
      case "active": return activeC;
      case "error": return errorC;
      default: return COLORS.gray300;
    }
  };

  const getStepLabel = (index: number, step: ProgressStep, status: StepStatus) => {
    if (step.icon) return step.icon;
    if (variant === "checkmarks" && status === "completed") return "✓";
    if (variant === "dots") return "";
    if (variant === "circles") return "";
    return `${index + 1}`;
  };

  const INDICATOR_SIZE = variant === "dots" ? 10 : 32;

  const styles = StyleSheet.create({
    // ---- Horizontal ----
    hContainer: {
      flexDirection: "column",
    },
    hStepsRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    hStepWrapper: {
      flex: 1,
      alignItems: "center",
    },
    hConnector: {
      flex: 1,
      height: 2,
      marginBottom: variant === "dots" ? 0 : 0,
    },
    hLabelRow: {
      flexDirection: "row",
      marginTop: SIZES.padding.sm,
    },
    hLabelItem: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 2,
    },
    // ---- Vertical ----
    vContainer: {
      flexDirection: "column",
    },
    vStep: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    vLeft: {
      alignItems: "center",
      width: INDICATOR_SIZE,
      marginRight: SIZES.padding.md,
    },
    vConnector: {
      width: 2,
      flex: 1,
      minHeight: 24,
      marginTop: 4,
      marginBottom: 4,
    },
    vContent: {
      flex: 1,
      paddingBottom: SIZES.padding.lg,
    },
    // ---- Shared ----
    indicator: {
      width: INDICATOR_SIZE,
      height: INDICATOR_SIZE,
      borderRadius: INDICATOR_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
    },
    indicatorText: {
      ...FONTS.caption,
      color: COLORS.white,
      fontFamily: FONTS.family.bold,
      fontSize: 12,
    },
    stepLabel: {
      ...FONTS.caption,
      textAlign: "center",
      marginTop: 4,
    },
    stepDesc: {
      ...FONTS.caption,
      color: COLORS.textTertiary,
      textAlign: "center",
      marginTop: 2,
    },
    vStepLabel: {
      ...FONTS.bodyMedium,
    },
    vStepDesc: {
      ...FONTS.bodySmall,
      marginTop: 2,
    },
    activeRing: {
      position: "absolute",
      width: INDICATOR_SIZE + 8,
      height: INDICATOR_SIZE + 8,
      borderRadius: (INDICATOR_SIZE + 8) / 2,
      borderWidth: 2,
    },
  });

  const renderIndicator = (step: ProgressStep, index: number) => {
    const status = getStatus(index, step);
    const color = getStepColor(status);
    const labelText = getStepLabel(index, step, status);
    const isActive = status === "active";

    return (
      <Animated.View
        style={{ transform: [{ scale: scaleAnims[index] }] }}
      >
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
          {isActive && (
            <View
              style={[
                styles.activeRing,
                { borderColor: color, opacity: 0.3 },
              ]}
            />
          )}
          <View
            style={[
              styles.indicator,
              {
                backgroundColor:
                  status === "upcoming" ? COLORS.white : color,
                borderWidth: status === "upcoming" ? 2 : 0,
                borderColor: COLORS.gray300,
              },
            ]}
          >
            {variant !== "dots" && (
              <Text
                style={[
                  styles.indicatorText,
                  { color: status === "upcoming" ? COLORS.gray400 : COLORS.white },
                ]}
              >
                {labelText}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderConnector = (index: number, isHorizontal: boolean) => {
    if (index === steps.length - 1) return null;
    const status = getStatus(index, steps[index]);
    const isFilled = status === "completed";
    const connColor = isFilled ? completedC : COLORS.gray200;

    const connectorProps = {
      borderStyle: connectorStyle === "solid" ? undefined : connectorStyle,
      backgroundColor: connectorStyle === "solid" ? connColor : "transparent",
      borderColor: connectorStyle !== "solid" ? connColor : undefined,
    };

    if (isHorizontal) {
      return (
        <View
          style={[
            styles.hConnector,
            connectorProps,
            connectorStyle !== "solid" && { borderTopWidth: 2 },
          ]}
        />
      );
    }
    return (
      <View
        style={[
          styles.vConnector,
          connectorProps,
          connectorStyle !== "solid" && { borderLeftWidth: 2 },
        ]}
      />
    );
  };

  if (orientation === "vertical") {
    return (
      <View style={[styles.vContainer, style]}>
        {steps.map((step, index) => {
          const status = getStatus(index, step);
          const stepColor = getStepColor(status);
          return (
            <TouchableOpacity
              key={index}
              style={styles.vStep}
              onPress={() => onStepPress?.(index)}
              activeOpacity={onStepPress ? 0.7 : 1}
            >
              <View style={styles.vLeft}>
                {renderIndicator(step, index)}
                {renderConnector(index, false)}
              </View>
              <View style={styles.vContent}>
                <Text style={[styles.vStepLabel, { color: stepColor }]}>
                  {step.label}
                </Text>
                {showDescriptions && step.description && (
                  <Text style={styles.vStepDesc}>{step.description}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // Horizontal
  return (
    <View style={[styles.hContainer, style]}>
      <View style={styles.hStepsRow}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={styles.hStepWrapper}
              onPress={() => onStepPress?.(index)}
              activeOpacity={onStepPress ? 0.7 : 1}
            >
              {renderIndicator(step, index)}
            </TouchableOpacity>
            {index < steps.length - 1 && renderConnector(index, true)}
          </React.Fragment>
        ))}
      </View>

      {/* Labels row */}
      <View style={styles.hLabelRow}>
        {steps.map((step, index) => {
          const status = getStatus(index, step);
          const stepColor = getStepColor(status);
          return (
            <View key={index} style={styles.hLabelItem}>
              <Text
                style={[
                  styles.stepLabel,
                  { color: status === "upcoming" ? COLORS.textTertiary : stepColor, fontFamily: status === "active" ? FONTS.family.semiBold : FONTS.family.regular },
                ]}
                numberOfLines={2}
              >
                {step.label}
              </Text>
              {showDescriptions && step.description && (
                <Text style={styles.stepDesc} numberOfLines={2}>
                  {step.description}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default { AppProgressBar, AppProgressSteps };

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*
// Progress Bar
<AppProgressBar progress={65} size="md" showLabel animated color={COLORS.primary} />
<AppProgressBar progress={40} variant="segmented" size="lg" showLabel labelPosition="outside-top" />
<AppProgressBar progress={80} showRange rangeStart="₹0" rangeEnd="₹10L" />

// Progress Steps — KYC
const kycSteps = [
  { label: "PAN", description: "Verify PAN card" },
  { label: "Aadhaar", description: "Link Aadhaar" },
  { label: "Bank", description: "Add bank account" },
  { label: "Done", description: "KYC complete" },
];
<AppProgressSteps steps={kycSteps} currentStep={1} variant="numbered" showDescriptions />
<AppProgressSteps steps={kycSteps} currentStep={2} orientation="vertical" variant="checkmarks" />
*/