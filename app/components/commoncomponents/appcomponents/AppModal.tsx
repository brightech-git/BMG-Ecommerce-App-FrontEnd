// components/AppModal.tsx
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableWithoutFeedback, StyleSheet,
  Animated, Dimensions, Modal, TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../../../theme';

const { width, height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** 'center' = dialog, 'bottom' = bottom sheet style */
  position?: 'center' | 'bottom';
  showClose?: boolean;
  /** Width as fraction of screen (center mode only) */
  widthFraction?: number;
};

export default function AppModal({
  visible, onClose, title, subtitle,
  children, position = 'center',
  showClose = true, widthFraction = 0.88,
}: Props) {
  const { COLORS, FONTS, SIZES, SHADOWS, moderateScale } = useTheme();

  const backdropOp = useRef(new Animated.Value(0)).current;
  const contentY   = useRef(new Animated.Value(position === 'bottom' ? height : 60)).current;
  const contentOp  = useRef(new Animated.Value(0)).current;
  const contentSc  = useRef(new Animated.Value(position === 'center' ? 0.88 : 1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(contentY,   { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
        Animated.timing(contentOp,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(contentSc,  { toValue: 1, useNativeDriver: true, damping: 18 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(contentY,   { toValue: position === 'bottom' ? height : 40, duration: 200, useNativeDriver: true }),
        Animated.timing(contentOp,  { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(contentSc,  { toValue: position === 'center' ? 0.9 : 1, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        contentY.setValue(position === 'bottom' ? height : 60);
        contentSc.setValue(position === 'center' ? 0.88 : 1);
      });
    }
  }, [visible]);

  const CARD_W = width * widthFraction;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOp }]} />
      </TouchableWithoutFeedback>

      {/* Content */}
      <View
        style={[
          position === 'bottom' ? styles.bottomAnchor : styles.centerAnchor,
        ]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.card,
            position === 'bottom' ? styles.bottomCard : [styles.centerCard, { width: CARD_W }],
            {
              backgroundColor: COLORS.white,
              opacity: contentOp,
              transform: [
                { translateY: contentY },
                ...(position === 'center' ? [{ scale: contentSc }] : []),
              ],
              ...SHADOWS.xl,
            },
          ]}
        >
          {/* Top drag handle (bottom mode) */}
          {position === 'bottom' && (
            <View style={[styles.handle, { backgroundColor: COLORS.gray300 }]} />
          )}

          {/* Header row */}
          {(title || showClose) && (
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                {title && (
                  <Text style={[styles.title, { fontFamily: FONTS.family.bold, fontSize: SIZES.font.xl, color: COLORS.textPrimary }]}>
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text style={[styles.subtitle, { fontFamily: FONTS.family.regular, fontSize: SIZES.font.sm, color: COLORS.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>
              {showClose && (
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: COLORS.gray100 }]}>
                  <Ionicons name="close" size={moderateScale(18)} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Divider if header exists */}
          {title && <View style={[styles.divider, { backgroundColor: COLORS.borderLight }]} />}

          {/* Body */}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  centerAnchor: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  bottomAnchor: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  card:         { overflow: 'hidden' },
  centerCard:   { borderRadius: 24, padding: 24 },
  bottomCard:   { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
  handle:       { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  headerRow:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  title:        { letterSpacing: -0.2 },
  subtitle:     { marginTop: 3 },
  closeBtn:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  divider:      { height: StyleSheet.hairlineWidth, marginBottom: 16 },
});