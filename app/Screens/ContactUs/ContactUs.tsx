// app/Screens/ContactUs/ContactUs.tsx
// Shows real company info from /company/all + contact form POST /contact/submit
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Linking,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { callApi } from '../../api/apiClient';
import { MISC } from '../../api/endpoints';
import { toastError, toastSuccess } from '../../utils/toast';
import { useProfile } from '../../api/hooks/useProfile';
import { useCompany } from '../../api/hooks/useCompany';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUBJECTS = [
  'Order Enquiry',
  'Product Information',
  'Return / Refund',
  'Customisation Request',
  'Feedback',
  'Other',
];

/* ── Tiny helpers ── */
const openLink = (url?: string | null) => {
  if (!url?.trim()) return;
  Linking.openURL(url.trim()).catch(() => {});
};

const callPhone = (phone?: string | null) => {
  if (!phone) return;
  Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {});
};

const openMail = (email?: string | null) => {
  if (!email) return;
  Linking.openURL(`mailto:${email}`).catch(() => {});
};

const Field = ({
  label, value, onChangeText, placeholder, multiline, keyboardType, maxLength, C,
}: any) => (
  <View style={styles.fieldWrap}>
    <Text style={[styles.label, C && { color: C.title }]}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textarea, C && { backgroundColor: C.input, borderColor: C.borderColor, color: C.title }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C ? C.placeholder : COLORS.placeholder}
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
  const { isDark, colors: C } = useTheme();
  const { profile } = useProfile();
  const { data: company, isLoading: companyLoading } = useCompany();

  const [name,    setName]    = useState<string>('');
  const [email,   setEmail]   = useState<string>('');
  const [phone,   setPhone]   = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSub]  = useState(false);
  const [submitted, setDone]  = useState(false);

  useEffect(() => {
    if (!profile) return;
    const u: any = profile;
    setName(u.username ?? u.name ?? u.customerName ?? '');
    setEmail(u.email ?? '');
    setPhone(u.contactNumber ?? u.contact ?? u.phone ?? '');
  }, [profile]);

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
      const params = { name: name.trim(), email: email.trim(), mobileNumber: phone.trim(), comment: `${subject} - ${message.trim()}` };
      const headers = { 'Content-Type': 'application/json' };
      console.log('[ContactUs] Params:', params);
      console.log('[ContactUs] Headers:', headers);
      const response = await callApi<any, any>({
        method: 'post',
        url: MISC.CONTACT_SUBMIT,
        params,
      });
      console.log('[ContactUs] Response:', response);
      setDone(true);
    } catch (e: any) {
      console.log('[ContactUs] Error:', e);
      const msg =
        e?.response?.data?.message ?? e?.response?.data?.error ??
        e?.message ?? 'Could not send message. Please try again.';
      toastError('Send failed', msg);
    } finally {
      setSub(false);
    }
  };

  /* ── Resolve company fields ── */
  const companyName = company?.COMPANYNAME ?? 'BMG JEWELLERS PRIVATE LIMITED';
  const companyAddr = [
    company?.ADDRESS1,
    company?.ADDRESS2,
    company?.ADDRESS3,
    company?.AREACODE,
  ].filter(Boolean).join(', ');
  const companyPhone = company?.PHONE ?? '7094670946';
  const companyEmail = company?.EMAIL ?? 'contact@bmgjewellers.in';

  const socials = [
    { icon: 'instagram',  url: company?.INSTALINK,     label: 'Instagram' },
    { icon: 'facebook',   url: company?.FACEBOOKLINK,  label: 'Facebook' },
    { icon: 'twitter',    url: company?.TWITTERLINK,   label: 'Twitter / X' },
    { icon: 'youtube',    url: company?.YOUTUBELINK,   label: 'YouTube' },
  ].filter(s => !!s.url);

  /* ── Success view ── */
  if (submitted) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
          <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color={C.title} />
          </TouchableOpacity>
          <Text style={[styles.hTitle, { color: C.title }]}>Contact Us</Text>
          <View style={styles.hBtn} />
        </View>
        <View style={styles.successCenter}>
          <View style={styles.successCircle}>
            <Feather name="check-circle" size={56} color={COLORS.success} />
          </View>
          <Text style={[styles.successTitle, { color: C.title }]}>Message Sent!</Text>
          <Text style={[styles.successSub, { color: C.textLight }]}>
            Thank you for reaching out.{'\n'}Our team will get back to you within 24–48 hours.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Form view ── */
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
        <Text style={[styles.hTitle, { color: C.title }]}>Contact Us</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Company Info Card ── */}
        {companyLoading ? (
          <View style={[styles.infoCard, { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }]}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <View style={[styles.infoCard, { backgroundColor: C.card }]}>
            {/* Company name */}
            <Text style={[styles.companyName, { color: C.title }]}>{companyName}</Text>

            {/* Address */}
            {!!companyAddr && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                  <Feather name="map-pin" size={15} color={COLORS.primary} />
                </View>
                <Text style={[styles.infoText, { color: C.text }]}>{companyAddr}</Text>
              </View>
            )}

            {/* Phone — tappable */}
            <TouchableOpacity style={styles.infoRow} onPress={() => callPhone(companyPhone)} activeOpacity={0.7}>
              <View style={styles.infoIconBox}>
                <Feather name="phone" size={15} color={COLORS.primary} />
              </View>
              <Text style={[styles.infoText, styles.infoLink]}>+91 {companyPhone}</Text>
            </TouchableOpacity>

            {/* Email — tappable */}
            <TouchableOpacity style={styles.infoRow} onPress={() => openMail(companyEmail)} activeOpacity={0.7}>
              <View style={styles.infoIconBox}>
                <Feather name="mail" size={15} color={COLORS.primary} />
              </View>
              <Text style={[styles.infoText, styles.infoLink]}>{companyEmail}</Text>
            </TouchableOpacity>

            {/* Social media row */}
            {socials.length > 0 && (
              <View style={[styles.socialsRow, { borderTopColor: C.borderColor }]}>
                {socials.map((s) => (
                  <TouchableOpacity
                    key={s.label}
                    style={styles.socialBtn}
                    onPress={() => openLink(s.url)}
                    activeOpacity={0.75}
                  >
                    <Feather name={s.icon as any} size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Contact Form ── */}
        <Text style={[styles.formHeading, { color: C.title }]}>Send us a message</Text>

        <Field label="Full Name *" value={name} onChangeText={setName} placeholder="Your name" C={C} />
        <Field label="Email Address *" value={email} onChangeText={setEmail}
          placeholder="your@email.com" keyboardType="email-address" C={C} />
        <Field label="Phone Number" value={phone} onChangeText={setPhone}
          placeholder="Optional" keyboardType="phone-pad" C={C} />

        {/* Subject chips */}
        <Text style={[styles.label, { marginTop: 14, marginBottom: 8, color: C.title }]}>Subject *</Text>
        <View style={styles.chipGrid}>
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, { backgroundColor: C.card, borderColor: C.borderColor }, subject === s && styles.chipActive]}
              onPress={() => setSubject(s)}
            >
              {subject === s && (
                <Feather name="check" size={11} color={COLORS.white} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.chipTxt, { color: C.text }, subject === s && styles.chipTxtActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message */}
        <Field label="Message *" value={message} onChangeText={setMessage}
          placeholder="Tell us how we can help you…" multiline maxLength={1000} C={C} />
        <Text style={[styles.charCount, { color: C.textLight }]}>{message.length}/1000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          disabled={submitting}
          onPress={onSubmit}
        >
          {submitting
            ? <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
            : <Feather name="send" size={16} color={COLORS.white} style={{ marginRight: 8 }} />}
          <Text style={styles.submitTxt}>{submitting ? 'Sending…' : 'Send Message'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  hBtn:   { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, textAlign: 'center', ...FONTS.h5, ...FONTS.fontSemiBold },
  scroll: { padding: SIZES.padding, paddingBottom: 40 },

  // Company info card
  infoCard: { borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  companyName: { ...FONTS.h6, ...FONTS.fontSemiBold, marginBottom: 14, textAlign: 'center' },
  infoRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  infoIconBox:{ width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.primary + '12', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoText:   { flex: 1, ...FONTS.fontSm, lineHeight: 20, paddingTop: 5 },
  infoLink:   { color: COLORS.primary, textDecorationLine: 'underline' },

  // Social buttons
  socialsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingTop: 4, marginTop: 4, borderTopWidth: 1, paddingBottom: 2 },
  socialBtn:  { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary + '30' },

  // Form heading
  formHeading: { ...FONTS.h6, ...FONTS.fontSemiBold, marginBottom: 16 },

  // Form fields
  fieldWrap: { marginBottom: 14 },
  label:     { ...FONTS.fontSm, ...FONTS.fontSemiBold, marginBottom: 6 },
  input:     { borderWidth: 1, borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 12, ...FONTS.font },
  textarea:  { minHeight: 110, lineHeight: 20 },

  // Chips
  chipGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: SIZES.radius, borderWidth: 1.5 },
  chipActive:    { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt:       { ...FONTS.fontSm },
  chipTxtActive: { color: COLORS.white },
  charCount:     { ...FONTS.fontXs, textAlign: 'right', marginTop: -8, marginBottom: 4 },

  // Submit
  submitBtn:         { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center',marginBottom: 40 },
  submitBtnDisabled: { opacity: 0.6 },
  submitTxt:         { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },

  // Success
  successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: COLORS.success + '18', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle:  { ...FONTS.h3, ...FONTS.fontSemiBold, textAlign: 'center' },
  successSub:    { ...FONTS.font, textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 300 },
  primaryBtn:    { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 14, paddingHorizontal: 48, marginTop: 28 },
  primaryTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default ContactUs;
