import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useTheme } from "../../../theme";

// ============================================================
// TYPES
// ============================================================

export type EmptyStateVariant =
  | "no-data"
  | "no-transactions"
  | "no-portfolio"
  | "no-results"
  | "no-internet"
  | "error"
  | "coming-soon"
  | "custom";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateCTA {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: string;
}

export interface AppEmptyStateProps {
  /** Preset variant (auto-fills illustration, title, subtitle) */
  variant?: EmptyStateVariant;
  /** Custom emoji/icon (overrides preset illustration) */
  illustration?: string;
  /** Custom image source */
  imageSource?: ImageSourcePropType;
  /** Image/illustration size */
  imageSize?: number;
  /** Main title */
  title?: string;
  /** Subtitle / description */
  subtitle?: string;
  /** Primary CTA */
  cta?: EmptyStateCTA;
  /** Secondary CTA */
  secondaryCta?: EmptyStateCTA;
  /** Overall size preset */
  size?: EmptyStateSize;
  /** Background fill for illustration circle */
  illustrationBackground?: string;
  /** Animate on mount */
  animated?: boolean;
  /** Outer container style */
  style?: object;
  /** Show decorative dots/shapes */
  showDecorations?: boolean;
}

// ============================================================
// PRESETS
// ============================================================
interface EmptyPreset {
  illustration: string;
  title: string;
  subtitle: string;
}

const PRESETS: Record<EmptyStateVariant, EmptyPreset> = {
  "no-data": {
    illustration: "📭",
    title: "Nothing here yet",
    subtitle: "Data will appear here once available.",
  },
  "no-transactions": {
    illustration: "💳",
    title: "No transactions yet",
    subtitle: "Your transaction history will appear here once you start investing.",
  },
  "no-portfolio": {
    illustration: "📊",
    title: "Your portfolio is empty",
    subtitle: "Start your investment journey by adding your first gold purchase.",
  },
  "no-results": {
    illustration: "🔍",
    title: "No results found",
    subtitle: "Try adjusting your search or filters to find what you're looking for.",
  },
  "no-internet": {
    illustration: "📡",
    title: "No internet connection",
    subtitle: "Please check your connection and try again.",
  },
  error: {
    illustration: "⚠️",
    title: "Something went wrong",
    subtitle: "We couldn't load this content. Please try again.",
  },
  "coming-soon": {
    illustration: "🚀",
    title: "Coming soon",
    subtitle: "We're working on something exciting. Stay tuned!",
  },
  custom: {
    illustration: "📋",
    title: "No data",
    subtitle: "",
  },
};

// ============================================================
// SIZE MAP
// ============================================================
const SIZE_CONFIG = {
  sm: { emojiSize: 40, iconBg: 72, titleStyle: "h5", gap: 8 },
  md: { emojiSize: 52, iconBg: 96, titleStyle: "h4", gap: 12 },
  lg: { emojiSize: 64, iconBg: 120, titleStyle: "h3", gap: 16 },
} as const;

// ============================================================
// CTA BUTTON
// ============================================================
const CTAButton: React.FC<{
  cta: EmptyStateCTA;
  primary?: boolean;
}> = ({ cta, primary = true }) => {
  const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

  const getBtnStyle = () => {
    const v = cta.variant ?? (primary ? "primary" : "outline");
    switch (v) {
      case "primary":
        return {
          container: {
            backgroundColor: COLORS.primary,
            ...SHADOWS.orange,
          },
          text: { color: COLORS.white },
        };
      case "secondary":
        return {
          container: { backgroundColor: COLORS.gray100 },
          text: { color: COLORS.textPrimary },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: COLORS.primary,
          },
          text: { color: COLORS.primary },
        };
      case "ghost":
        return {
          container: { backgroundColor: "transparent" },
          text: { color: COLORS.primary },
        };
    }
  };

  const btnStyle = getBtnStyle();

  return (
    <TouchableOpacity
      style={[
        {
          height: SIZES.button.md,
          borderRadius: SIZES.radius.button,
          paddingHorizontal: SIZES.padding.xxl,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        },
        btnStyle.container,
      ]}
      onPress={cta.onPress}
      activeOpacity={0.8}
    >
      {cta.icon && (
        <Text style={{ fontSize: 16 }}>{cta.icon}</Text>
      )}
      <Text style={[FONTS.button, btnStyle.text]}>{cta.label}</Text>
    </TouchableOpacity>
  );
};

// ============================================================
// COMPONENT
// ============================================================
const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  variant = "no-data",
  illustration,
  imageSource,
  imageSize,
  title,
  subtitle,
  cta,
  secondaryCta,
  size = "md",
  illustrationBackground,
  animated = true,
  style,
  showDecorations = true,
}) => {
  const { COLORS, FONTS, SIZES, SHADOWS } = useTheme();

  const preset = PRESETS[variant];
  const displayIllustration = illustration ?? preset.illustration;
  const displayTitle = title ?? preset.title;
  const displaySubtitle = subtitle ?? preset.subtitle;
  const sizeConfig = SIZE_CONFIG[size];

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(translateAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 14,
          stiffness: 100,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 100,
        }),
      ]).start();

      // Float loop for illustration
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
      translateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, []);

  const iconBgColor =
    illustrationBackground ??
    (variant === "error"
      ? COLORS.errorLight + "20"
      : variant === "no-internet"
      ? COLORS.infoLight + "20"
      : COLORS.primaryPale);

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: SIZES.padding.xxl,
      paddingVertical: SIZES.padding.xxxl,
    },
    decorContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
    },
    decorDot: {
      position: "absolute",
      borderRadius: 999,
      opacity: 0.4,
    },
    illustrationWrap: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: sizeConfig.gap * 2,
    },
    iconBg: {
      width: sizeConfig.iconBg,
      height: sizeConfig.iconBg,
      borderRadius: sizeConfig.iconBg / 2,
      backgroundColor: iconBgColor,
      alignItems: "center",
      justifyContent: "center",
    },
    emojiText: {
      fontSize: sizeConfig.emojiSize,
      lineHeight: sizeConfig.emojiSize * 1.2,
    },
    image: {
      width: imageSize ?? sizeConfig.iconBg,
      height: imageSize ?? sizeConfig.iconBg,
      borderRadius: (imageSize ?? sizeConfig.iconBg) / 2,
    },
    ring: {
      position: "absolute",
      width: sizeConfig.iconBg + 20,
      height: sizeConfig.iconBg + 20,
      borderRadius: (sizeConfig.iconBg + 20) / 2,
      borderWidth: 1,
      borderColor: COLORS.primary,
      opacity: 0.15,
    },
    ring2: {
      position: "absolute",
      width: sizeConfig.iconBg + 40,
      height: sizeConfig.iconBg + 40,
      borderRadius: (sizeConfig.iconBg + 40) / 2,
      borderWidth: 1,
      borderColor: COLORS.primary,
      opacity: 0.08,
    },
    title: {
      textAlign: "center",
      marginBottom: sizeConfig.gap,
      ...(size === "lg" ? FONTS.h3 : size === "sm" ? FONTS.h5 : FONTS.h4),
    },
    subtitle: {
      ...FONTS.bodySmall,
      textAlign: "center",
      color: COLORS.textSecondary,
      lineHeight: 20,
      marginBottom: sizeConfig.gap * 2,
      maxWidth: 280,
    },
    ctaContainer: {
      gap: SIZES.padding.sm,
      alignItems: "center",
      width: "100%",
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      {/* Decorations */}
      {showDecorations && (
        <View style={styles.decorContainer} pointerEvents="none">
          <View
            style={[
              styles.decorDot,
              {
                width: 80,
                height: 80,
                top: -20,
                right: -20,
                backgroundColor: COLORS.primaryPale,
              },
            ]}
          />
          <View
            style={[
              styles.decorDot,
              {
                width: 50,
                height: 50,
                bottom: 40,
                left: -10,
                backgroundColor: COLORS.secondaryLighter,
              },
            ]}
          />
          <View
            style={[
              styles.decorDot,
              {
                width: 30,
                height: 30,
                top: 60,
                left: 20,
                backgroundColor: COLORS.orangeIce,
              },
            ]}
          />
        </View>
      )}

      {/* Illustration */}
      <Animated.View
        style={[
          styles.illustrationWrap,
          { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] },
        ]}
      >
        <View style={styles.ring2} />
        <View style={styles.ring} />
        <View style={styles.iconBg}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="contain" />
          ) : (
            <Text style={styles.emojiText}>{displayIllustration}</Text>
          )}
        </View>
      </Animated.View>

      {/* Text */}
      <Text style={styles.title}>{displayTitle}</Text>
      {!!displaySubtitle && (
        <Text style={styles.subtitle}>{displaySubtitle}</Text>
      )}

      {/* CTAs */}
      {(cta || secondaryCta) && (
        <View style={styles.ctaContainer}>
          {cta && <CTAButton cta={cta} primary />}
          {secondaryCta && <CTAButton cta={secondaryCta} primary={false} />}
        </View>
      )}
    </Animated.View>
  );
};

export default AppEmptyState;

// ============================================================
// USAGE EXAMPLES
// ============================================================
/*
// Preset variant
<AppEmptyState
  variant="no-portfolio"
  cta={{ label: "Start Investing", onPress: () => nav.navigate("Buy"), icon: "💰" }}
/>

// Custom
<AppEmptyState
  variant="custom"
  illustration="🏆"
  title="No active SIPs"
  subtitle="Set up a SIP to automate your gold investments"
  cta={{ label: "Create SIP", onPress: handleCreate }}
  secondaryCta={{ label: "Learn More", onPress: handleLearn, variant: "ghost" }}
/>

// Error state with retry
<AppEmptyState
  variant="error"
  cta={{ label: "Try Again", onPress: refetch, variant: "outline" }}
/>
*/