// app/Screens/AboutUs/AboutUs.tsx
// Website page: /about — company info. Data: GET /company/all (HOME.COMPANY).
// Files created: app/Screens/AboutUs/AboutUs.tsx
// Files modified: homeService.ts (add getCompanyInfo), useHome.ts (add useCompanyInfo),
//                 StackNavigator.tsx (register route), RootStackParamList.tsx (add type).
// Navigation: accessible from Profile → "About Us" row.
// API: useCompanyInfo() → HOME.COMPANY → /company/all
// States: loading (Loader), error (ErrorState), populated view.
// NOTE: root App.tsx provides SafeAreaView — use a plain View container.
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useCompanyInfo } from '../../api/hooks/useHome';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, ErrorState } from '../../components/common/StateViews';
import { absUrl } from '../../utils/image';

const Section = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    {!!title && <Text style={styles.secTitle}>{title}</Text>}
    {children}
  </View>
);

const AboutUs = () => {
  const navigation = useNavigation<any>();
  const { data, isLoading, isError, refetch, isRefetching } = useCompanyInfo();

  const company: any = useMemo(() => {
    const d: any = data;
    return d?.data ?? d?.company ?? (Array.isArray(d) ? d[0] : d) ?? {};
  }, [data]);

  const name        = company.companyName ?? company.name ?? 'BMG Jewellers';
  const tagline     = company.tagline ?? company.subTitle ?? '';
  const description = company.description ?? company.about ?? company.content ?? '';
  const vision      = company.vision ?? '';
  const mission     = company.mission ?? '';
  const established = company.established ?? company.foundedYear ?? '';
  const logoUrl     = company.logo ?? company.logoUrl ?? company.image ?? '';
  const address     = company.address ?? company.companyAddress ?? '';
  const email       = company.email ?? company.contactEmail ?? '';
  const phone       = company.phone ?? company.contactNumber ?? company.mobile ?? '';

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>About Us</Text>
        <View style={styles.hBtn} />
      </View>

      {isLoading ? (
        <Loader message="Loading..." />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
        >
          {/* Hero / logo */}
          <View style={styles.hero}>
            {!!logoUrl ? (
              <SmartImage uri={absUrl(logoUrl)} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Feather name="award" size={48} color={COLORS.primary} />
              </View>
            )}
            <Text style={styles.brandName}>{name}</Text>
            {!!tagline && <Text style={styles.tagline}>{tagline}</Text>}
            {!!established && (
              <View style={styles.estBadge}>
                <Text style={styles.estTxt}>Est. {established}</Text>
              </View>
            )}
          </View>

          {/* About / description */}
          {!!description && (
            <Section title="Our Story">
              <Text style={styles.bodyText}>{description}</Text>
            </Section>
          )}

          {/* Vision */}
          {!!vision && (
            <Section>
              <View style={styles.visionCard}>
                <View style={styles.visionIcon}>
                  <Feather name="eye" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visionLabel}>Our Vision</Text>
                  <Text style={styles.visionText}>{vision}</Text>
                </View>
              </View>
            </Section>
          )}

          {/* Mission */}
          {!!mission && (
            <Section>
              <View style={[styles.visionCard, { borderLeftColor: COLORS.secondary }]}>
                <View style={[styles.visionIcon, { backgroundColor: COLORS.secondary + '18' }]}>
                  <Feather name="target" size={20} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.visionLabel, { color: COLORS.secondary }]}>Our Mission</Text>
                  <Text style={styles.visionText}>{mission}</Text>
                </View>
              </View>
            </Section>
          )}

          {/* Contact details from company record */}
          {(!!address || !!email || !!phone) && (
            <Section title="Contact">
              {!!address && (
                <View style={styles.contactRow}>
                  <Feather name="map-pin" size={16} color={COLORS.primary} />
                  <Text style={styles.contactTxt}>{address}</Text>
                </View>
              )}
              {!!phone && (
                <View style={styles.contactRow}>
                  <Feather name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.contactTxt}>{phone}</Text>
                </View>
              )}
              {!!email && (
                <View style={styles.contactRow}>
                  <Feather name="mail" size={16} color={COLORS.primary} />
                  <Text style={styles.contactTxt}>{email}</Text>
                </View>
              )}
            </Section>
          )}

          {/* Fallback if API returned nothing useful */}
          {!description && !vision && !mission && (
            <Section>
              <Text style={styles.bodyText}>
                BMG Jewellers is a trusted name in fine jewellery, offering an exquisite collection of
                gold, diamond, and precious stone ornaments crafted with unmatched artistry. We are
                committed to quality, purity, and creating jewellery that tells your story.
              </Text>
            </Section>
          )}
        </ScrollView>
      )}
    </View>
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
  scroll: { paddingBottom: 40 },
  // Hero
  hero: {
    alignItems: 'center', paddingVertical: 32, paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor,
  },
  logo: { width: 120, height: 80, marginBottom: 16 },
  logoPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brandName: { fontFamily: 'MarcellusRegular', fontSize: 26, color: COLORS.title, textAlign: 'center' },
  tagline: { ...FONTS.fontSm, color: COLORS.textLight, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  estBadge: {
    marginTop: 12, backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
  },
  estTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  // Sections
  section: { marginTop: 20, paddingHorizontal: SIZES.padding },
  secTitle: { fontFamily: 'MarcellusRegular', fontSize: 18, color: COLORS.title, marginBottom: 10 },
  bodyText: { ...FONTS.font, color: COLORS.text, lineHeight: 24 },
  // Vision / Mission
  visionCard: {
    flexDirection: 'row', gap: 12, backgroundColor: COLORS.white,
    borderRadius: 14, padding: 16,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  visionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  visionLabel: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary, marginBottom: 4 },
  visionText: { ...FONTS.fontSm, color: COLORS.text, lineHeight: 20 },
  // Contact
  contactRow: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: COLORS.white, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  contactTxt: { flex: 1, ...FONTS.fontSm, color: COLORS.text, lineHeight: 20 },
});

export default AboutUs;
