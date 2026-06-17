/**
 * BMG Jewellers — Centralized Theme
 *
 * Matches the BMG website CSS variables:
 *   --primary-hover-color : #ea580c  (orange)
 *   --primary-text-color  : #041f60  (navy)
 *   --primary-card-color  : #fff7ed  (light orange)
 *   --secondary-card-color: #ffedd5  (soft peach)
 *
 * Usage:
 *   import { colors, fonts, spacing } from '../theme/theme';
 */

// ─── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Primary orange palette (website's --primary-hover-color / --secondary-text-color)
  primary: '#ea580c',           // Main orange
  primaryDark: '#c2410c',       // Darker orange (hover / pressed)
  primaryLight: '#f97316',      // Lighter orange (accents)
  primaryMild: '#fb923c',       // Mild orange (buttons, soft CTA)
  primarySoft: '#fed7aa',       // Very soft orange (borders, subtle bg)

  // Card / surface tints (website's --primary-card-color / --secondary-card-color)
  cardPrimary: '#fff7ed',       // Light orange card bg
  cardSecondary: '#ffedd5',     // Soft peach card bg

  // Text (website's --primary-text-color)
  text: '#041f60',              // Navy — headings & body
  textSecondary: '#475569',     // Slate grey — secondary text
  textLight: '#94a3b8',         // Light grey — placeholders, captions

  // Surfaces
  background: '#FAFAFA',        // Page background
  surface: '#FFFFFF',           // Card / sheet surface
  inputBg: '#F5F5F5',          // Input field background

  // Borders
  border: '#E2E8F0',           // Default border
  borderLight: '#F1F5F9',      // Subtle border

  // Header
  headerBg: '#ea580c',         // Orange header background
  headerText: '#FFFFFF',       // White text on header
  tickerBg: '#c2410c',         // Ticker bar (darker orange)
  tickerText: '#FFFFFF',       // Ticker text

  // Semantic
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  placeholder: '#94a3b8',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

// ─── Fonts ───────────────────────────────────────────────────────────────────
// Website uses Lato throughout. On RN we fall back to system fonts unless
// custom fonts are loaded via expo-font / react-native-asset.
export const fonts = {
  // Family names — swap to 'Lato' once the font files are loaded
  regular: 'System',
  medium: 'System',
  bold: 'System',
  extraBold: 'System',

  // Sizes
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 38,
  },

  // Weights (string for RN StyleSheet)
  weight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900',
  },

  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },

  // Line height multipliers
  leading: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// ─── Border Radius ───────────────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

// ─── Shadows (iOS + Android) ─────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  orange: {
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};

// ─── Default export bundle ───────────────────────────────────────────────────
const theme = {colors, fonts, spacing, radius, shadows};
export default theme;
