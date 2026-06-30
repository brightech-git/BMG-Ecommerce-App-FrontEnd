// app/Screens/profile/OrderReturn.tsx
// Website page: /return (ReturnRequest). Mirrors the website's refund/return form.
// Files created: app/Screens/profile/OrderReturn.tsx
// Files modified: StackNavigator.tsx (register route), Trackorder.tsx (add "Return" button),
//                 RootStackParamList.tsx (already typed as OrderReturn).
// Navigation: accessible from Trackorder screen via "Request Return" button.
// API: POST /refunds/submit  (MISC.REFUND_SUBMIT)
// Payload: { orderId, reason, description }
// States: loading on submit, success view, validation errors.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { callApi } from '../../api/apiClient';
import { MISC } from '../../api/endpoints';
import { toastError } from '../../utils/toast';

type Props = StackScreenProps<RootStackParamList, 'OrderReturn'>;

const REASONS = [
  'Received wrong item',
  'Item is defective / damaged',
  'Item not as described',
  'Missing parts or accessories',
  'Changed my mind',
  'Other',
];

const OrderReturn = ({ route, navigation }: Props) => {
  const { orderId } = route.params;
  const { isDark, colors: C } = useTheme();
  const [reason, setReason]       = useState('');
  const [description, setDesc]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const onSubmit = async () => {
    if (!reason) { toastError('Please select a return reason'); return; }
    if (!description.trim()) { toastError('Please describe the issue'); return; }

    try {
      setSubmitting(true);
      await callApi<any, any>({
        method: 'post',
        url: MISC.REFUND_SUBMIT,
        data: {
          orderId: String(orderId),
          reason,
          description: description.trim(),
        },
      });
      setSubmitted(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        'Could not submit return request. Please try again.';
      toastError('Submission failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success view ──────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={C.title} />
          </TouchableOpacity>
          <Text style={[styles.hTitle, { color: C.title }]}>Return Request</Text>
          <View style={styles.hBtn} />
        </View>
        <View style={styles.successCenter}>
          <View style={styles.successCircle}>
            <Feather name="check-circle" size={56} color={COLORS.success} />
          </View>
          <Text style={[styles.successTitle, { color: C.title }]}>Request Submitted!</Text>
          <Text style={[styles.successSub, { color: C.textLight }]}>
            Your return request for Order #{orderId} has been received.{'\n'}
            Our team will review and get back to you within 2–3 business days.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Myorder')}
          >
            <Text style={styles.primaryTxt}>View My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => navigation.navigate('DrawerNavigation' as never)}
          >
            <Text style={styles.ghostTxt}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Form view ─────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.safe, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Request Return</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Order reference */}
        <View style={styles.orderBadge}>
          <Feather name="package" size={16} color={COLORS.primary} />
          <Text style={styles.orderBadgeTxt}>Order #{orderId}</Text>
        </View>

        {/* Reason selector */}
        <Text style={[styles.label, { color: C.title }]}>Reason for Return *</Text>
        <View style={styles.reasonGrid}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonChip, { backgroundColor: C.card, borderColor: C.borderColor }, reason === r && styles.reasonChipActive]}
              onPress={() => setReason(r)}
            >
              {reason === r && (
                <Feather name="check" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.reasonTxt, { color: C.text }, reason === r && styles.reasonTxtActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={[styles.label, { marginTop: 20, color: C.title }]}>
          Describe the issue *
        </Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: C.input, borderColor: C.borderColor, color: C.title }]}
          value={description}
          onChangeText={setDesc}
          placeholder="Provide details about the problem — e.g. the item colour doesn't match, the clasp is broken…"
          placeholderTextColor={C.placeholder}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={[styles.charCount, { color: C.textLight }]}>{description.length}/500</Text>

        {/* Policy note */}
        <View style={[styles.policyNote, { backgroundColor: C.card, borderLeftColor: C.borderColor }]}>
          <Feather name="info" size={14} color={C.textLight} />
          <Text style={[styles.policyTxt, { color: C.textLight }]}>
            Returns are accepted within 7 days of delivery. Items must be unused
            and in original packaging. Our team will review your request.
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          disabled={submitting}
          onPress={onSubmit}
        >
          <Text style={styles.submitTxt}>
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:          { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle:        { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  scroll:        { padding: SIZES.padding, paddingBottom: 40 },
  orderBadge:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', marginBottom: 24 },
  orderBadgeTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  label:         { ...FONTS.fontSm, ...FONTS.fontSemiBold, marginBottom: 10 },
  reasonGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: SIZES.radius, borderWidth: 1.5 },
  reasonChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  reasonTxt:    { ...FONTS.fontSm },
  reasonTxtActive: { color: COLORS.white },
  textarea:      { borderWidth: 1, borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 12, ...FONTS.font, minHeight: 120, lineHeight: 20 },
  charCount:     { ...FONTS.fontXs, textAlign: 'right', marginTop: 4 },
  policyNote:    { flexDirection: 'row', gap: 8, borderRadius: 10, padding: 12, marginTop: 20, borderLeftWidth: 3 },
  policyTxt:     { flex: 1, ...FONTS.fontXs, lineHeight: 17 },
  submitBtn:     { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt:     { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
  successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.success + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle:  { ...FONTS.h3, ...FONTS.fontSemiBold, textAlign: 'center' },
  successSub:    { ...FONTS.font, textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 300 },
  primaryBtn:    { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 14, paddingHorizontal: 40, marginTop: 28 },
  primaryTxt:    { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
  ghostBtn:      { paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  ghostTxt:      { ...FONTS.font, ...FONTS.fontSemiBold, color: COLORS.primary },
});

export default OrderReturn;
