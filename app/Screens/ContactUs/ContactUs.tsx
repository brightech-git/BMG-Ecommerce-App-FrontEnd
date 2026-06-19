// app/Screens/ContactUs/ContactUs.tsx
// Website page: /contact. Mirrors the website contact form.
// Files created: app/Screens/ContactUs/ContactUs.tsx
// Files modified: StackNavigator.tsx (register route), RootStackParamList.tsx (add type).
// Navigation: accessible from Profile → "Contact Us" row.
// API: POST /contact/submit  (MISC.CONTACT_SUBMIT)
// Payload: { name, email, phone, subject, message }
// States: submitting, success view, validation errors.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { callApi } from '../../api/apiClient';
import { MISC } from '../../api/endpoints';
import { toastError, toastSuccess } from '../../utils/toast';
import { useProfile } from '../../api/hooks/useProfile';

const SUBJECTS = [
  'Order Enquiry',
  'Product Information',
  'Return / Refund',
  'Customisation Request',
  'Feedback',
  'Other',
];

const Field = ({
  label, value, onChangeText, placeholder, multiline, keyboardType, maxLength,
}: any) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textarea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
      keyboardType={keyboardType ?? 'default'}
      maxLength={maxLength}
      autoCapitalize="sentences"
    />
  </View>
);

const ContactUs = () => {
  const navigation = useNavigation<any>();
  const { profile } = useProfile();
  const u: any = profile ?? {};

  const [name,    setName]    = useState<string>(u.username ?? u.name ?? u.customerName ?? '');
  const [email,   setEmail]   = useState<string>(u.email ?? '');
  const [phone,   setPhone]   = useState<string>(u.contactNumber ?? u.contact ?? u.phone ?? '');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSub]  = useState(false);
  const [submitted, setDone]  = useState(false);

  const validate = () => {
    if (!name.trim())    { toastError('Name is required'); return false; }
    if (!email.trim())   { toastError('Email is required'); return false; }
    if (!subject)        { toastError('Please select a subject'); return false; }
    if (!message.trim()) { toastError('Message is required'); return false; }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    try {
      setSub(true);
      await callApi<any, any>({
        method: 'post',
        url: MISC.CONTACT_SUBMIT,
        data: {
          name:    name.trim(),
          email:   email.trim(),
          phone:   phone.trim(),
          subject,
          message: message.trim(),
        },
      });
      setDone(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        'Could not send message. Please try again.';
      toastError('Send failed', msg);
    } finally {
      setSub(false);
    }
  };

  // ── Success view ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.hTitle}>Contact Us</Text>
          <View style={styles.hBtn} />
        </View>
        <View style={styles.successCenter}>
          <View style={styles.successCircle}>
            <Feather name="check-circle" size={56} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successSub}>
            Thank you for reaching out. Our team will get back to you within 24–48 hours.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Form view ─────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Contact Us</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Contact info strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Feather name="phone" size={16} color={COLORS.primary} />
            <Text style={styles.infoTxt}>+91 98765 43210</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Feather name="mail" size={16} color={COLORS.primary} />
            <Text style={styles.infoTxt}>support@bmgjewellers.com</Text>
          </View>
        </View>

        {/* Form fields */}
        <Field label="Full Name *" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="Email Address *" value={email} onChangeText={setEmail}
          placeholder="your@email.com" keyboardType="email-address" />
        <Field label="Phone Number" value={phone} onChangeText={setPhone}
          placeholder="Optional" keyboardType="phone-pad" />

        {/* Subject chips */}
        <Text style={[styles.label, { marginTop: 14, marginBottom: 8 }]}>Subject *</Text>
        <View style={styles.chipGrid}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, subject === s && styles.chipActive]}
              onPress={() => setSubject(s)}
            >
              {subject === s && (
                <Feather name="check" size={11} color={COLORS.white} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.chipTxt, subject === s && styles.chipTxtActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <Field label="Message *" value={message} onChangeText={setMessage}
          placeholder="Tell us how we can help you…" multiline maxLength={1000} />
        <Text style={styles.charCount}>{message.length}/1000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          disabled={submitting}
          onPress={onSubmit}
        >
          <Feather name="send" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.submitTxt}>{submitting ? 'Sending…' : 'Send Message'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  scroll: { padding: SIZES.padding, paddingBottom: 40 },
  // Info strip
  infoStrip: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14,
    padding: 14, marginBottom: 20, gap: 12,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoDivider: { width: 1, backgroundColor: COLORS.borderColor },
  infoTxt: { flex: 1, ...FONTS.fontXs, color: COLORS.text },
  // Form
  fieldWrap: { marginBottom: 14 },
  label: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 12,
    ...FONTS.font, color: COLORS.title,
  },
  textarea: { minHeight: 110, lineHeight: 20 },
  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: SIZES.radius, borderWidth: 1.5,
    borderColor: COLORS.borderColor, backgroundColor: COLORS.white,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt: { ...FONTS.fontSm, color: COLORS.text },
  chipTxtActive: { color: COLORS.white },
  charCount: { ...FONTS.fontXs, color: COLORS.textLight, textAlign: 'right', marginTop: -8, marginBottom: 4 },
  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg,
    paddingVertical: 15, alignItems: 'center', marginTop: 22,
    flexDirection: 'row', justifyContent: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
  // Success
  successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: COLORS.success + '18',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  successTitle: { ...FONTS.h3, ...FONTS.fontSemiBold, color: COLORS.title, textAlign: 'center' },
  successSub: {
    ...FONTS.font, color: COLORS.textLight, textAlign: 'center',
    marginTop: 10, lineHeight: 22, maxWidth: 300,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg,
    paddingVertical: 14, paddingHorizontal: 48, marginTop: 28,
  },
  primaryTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default ContactUs;
