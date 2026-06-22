// app/Screens/profile/HelpCenter.tsx
// Help & Info page — company info from /company/all, support links, legal links, social links.
import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyInfo } from '../../api/hooks/useHome';
import { absUrl } from '../../utils/image';
import { SmartImage } from '../../components/common/SmartImage';

type Props = StackScreenProps<RootStackParamList, 'HelpCenter'>;

const HelpCenter = ({ navigation }: Props) => {
  const { colors: C } = useTheme();
  const { data: rawData, isLoading } = useCompanyInfo();

  const company = useMemo(() => {
    const arr = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? [];
    return (arr[0] ?? {}) as any;
  }, [rawData]);

  const address = [
    company.ADDRESS1, company.ADDRESS2, company.ADDRESS3,
    company.AREACODE,
  ].filter(Boolean).join(', ');

  /* ── helper sub-components ─────────────────────────────────── */
  const SectionLabel = ({ title }: { title: string }) => (
    <Text style={[styles.sectionLabel, { color: C.textLight }]}>{title}</Text>
  );

  const Row = ({ icon, label, value, onPress, danger }: {
    icon: string; label: string; value?: string; onPress?: () => void; danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: C.borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? 'rgba(255,49,49,0.08)' : C.primaryLight }]}>
        <Feather name={icon as any} size={17} color={danger ? C.danger : C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: C.title }]}>{label}</Text>
        {!!value && <Text style={[styles.rowValue, { color: C.textLight }]} numberOfLines={2}>{value}</Text>}
      </View>
      {!!onPress && <Feather name="chevron-right" size={16} color={C.textLight} />}
    </TouchableOpacity>
  );

  const open = (url?: string) => { if (url?.trim()) Linking.openURL(url.trim()); };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Help & Info</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Company Card */}
        {!isLoading && !!company.COMPANYNAME && (
          <View style={[styles.companyCard, { backgroundColor: C.card }]}>
            {!!company.LOGO && (
              <SmartImage
                uri={absUrl(company.LOGO)}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.companyName, { color: C.title }]}>{company.COMPANYNAME}</Text>
            {!!company.GSTNO && (
              <Text style={[styles.companyMeta, { color: C.textLight }]}>GST: {company.GSTNO}</Text>
            )}
            {!!company.PANNO && (
              <Text style={[styles.companyMeta, { color: C.textLight }]}>PAN: {company.PANNO}</Text>
            )}
          </View>
        )}

        {/* Contact Info */}
        <SectionLabel title="CONTACT" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          {!!address && (
            <Row icon="map-pin" label="Address" value={address} />
          )}
          {!!company.PHONE && (
            <Row icon="phone" label="Phone" value={company.PHONE}
              onPress={() => open(`tel:${company.PHONE}`)} />
          )}
          {!!company.EMAIL && (
            <Row icon="mail" label="Email" value={company.EMAIL}
              onPress={() => open(`mailto:${company.EMAIL}`)} />
          )}
          {!!company.WHATSAPPLINK && (
            <Row icon="message-circle" label="WhatsApp" onPress={() => open(company.WHATSAPPLINK)} />
          )}
        </View>

        {/* Social Links */}
        {(company.FACEBOOKLINK || company.INSTALINK || company.YOUTUBELINK || company.TWITTERLINK) && (
          <>
            <SectionLabel title="FOLLOW US" />
            <View style={[styles.group, { backgroundColor: C.card }]}>
              {!!company.FACEBOOKLINK && (
                <Row icon="facebook" label="Facebook" onPress={() => open(company.FACEBOOKLINK)} />
              )}
              {!!company.INSTALINK && (
                <Row icon="instagram" label="Instagram" onPress={() => open(company.INSTALINK)} />
              )}
              {!!company.YOUTUBELINK && (
                <Row icon="youtube" label="YouTube" onPress={() => open(company.YOUTUBELINK)} />
              )}
              {!!company.TWITTERLINK && (
                <Row icon="twitter" label="Twitter / X" onPress={() => open(company.TWITTERLINK)} />
              )}
              {!!company.GOOGLEBUSINESSLINK && (
                <Row icon="map" label="Google Business" onPress={() => open(company.GOOGLEBUSINESSLINK)} />
              )}
            </View>
          </>
        )}

        {/* Support */}
        <SectionLabel title="SUPPORT" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          <Row icon="help-circle" label="FAQ"        onPress={() => navigation.navigate('Questions')} />
          <Row icon="phone"       label="Contact Us" onPress={() => navigation.navigate('ContactUs')} />
          <Row icon="info"        label="About Us"   onPress={() => navigation.navigate('AboutUs')} />
        </View>

        {/* Legal */}
        <SectionLabel title="LEGAL" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          <Row icon="shield"     label="Privacy Policy"        onPress={() => navigation.navigate('PolicyScreen', { type: 'privacy' })} />
          <Row icon="file-text"  label="Terms & Conditions"    onPress={() => navigation.navigate('PolicyScreen', { type: 'terms' })} />
          <Row icon="rotate-ccw" label="Refund Policy"         onPress={() => navigation.navigate('PolicyScreen', { type: 'refund' })} />
          <Row icon="truck"      label="Shipping & Delivery"   onPress={() => navigation.navigate('PolicyScreen', { type: 'shipping' })} />
          <Row icon="x-circle"   label="Cancellation & Return" onPress={() => navigation.navigate('PolicyScreen', { type: 'cancellation' })} />
          <Row icon="star"       label="Why Choose Us"         onPress={() => navigation.navigate('PolicyScreen', { type: 'why-choose-us' })} />
        </View>

        {/* App Links */}
        {!!company.ANDROIDLINK && (
          <>
            <SectionLabel title="DOWNLOAD APP" />
            <View style={[styles.group, { backgroundColor: C.card }]}>
              <Row icon="smartphone" label="BMG DigiSilver — Play Store"
                onPress={() => open(company.ANDROIDLINK)} />
            </View>
          </>
        )}

        <Text style={[styles.version, { color: C.textLight }]}>BMG Jewellers · v1.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hTitle:      { flex: 1, textAlign: 'center', ...FONTS.h6, ...FONTS.fontSemiBold },
  body:        { padding: SIZES.padding, paddingBottom: 40, gap: 0 },

  companyCard: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  companyLogo: { width: 100, height: 60, marginBottom: 12 },
  companyName: { ...FONTS.h6, ...FONTS.fontSemiBold, textAlign: 'center', marginBottom: 6 },
  companyMeta: { ...FONTS.fontXs, marginTop: 2 },

  sectionLabel: { ...FONTS.fontXs, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 16, marginLeft: 4 },
  group:        { borderRadius: 14, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, marginBottom: 4 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowLabel:     { ...FONTS.font, ...FONTS.fontMedium },
  rowValue:     { ...FONTS.fontXs, marginTop: 1 },

  version:      { textAlign: 'center', ...FONTS.fontXs, marginTop: 24 },
});

export default HelpCenter;
