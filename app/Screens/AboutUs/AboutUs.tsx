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
import { useTheme } from '../../context/ThemeContext';
import { useCompanyInfo } from '../../api/hooks/useHome';
import { SmartImage } from '../../components/common/SmartImage';
import { Loader, ErrorState } from '../../components/common/StateViews';
import { absUrl } from '../../utils/image';

const Section = ({ title, children, titleColor }: { title?: string; children: React.ReactNode; titleColor?: string }) => (
  <View style={styles.section}>
    {!!title && <Text style={[styles.secTitle, titleColor ? { color: titleColor } : undefined]}>{title}</Text>}
    {children}
  </View>
);

const AboutUs = () => {
  const { isDark, colors: C } = useTheme();
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
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>About Us</Text>
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
          <View style={[styles.hero, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
            {!!logoUrl ? (
              <SmartImage uri={absUrl(logoUrl)} style={styles.logo} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Feather name="award" size={48} color={COLORS.primary} />
              </View>
            )}
            <Text style={[styles.brandName, { color: C.title }]}>{name}</Text>
            {!!tagline && <Text style={[styles.tagline, { color: C.textLight }]}>{tagline}</Text>}
            {!!established && (
              <View style={styles.estBadge}>
                <Text style={styles.estTxt}>Est. {established}</Text>
              </View>
            )}
          </View>

          {/* About / description */}
          {!!description && (
            <Section title="Our Story" titleColor={C.title}>
              <Text style={[styles.bodyText, { color: C.text }]}>{description}</Text>
            </Section>
          )}

          {/* Vision */}
          {!!vision && (
            <Section>
              <View style={[styles.visionCard, { backgroundColor: C.card }]}>
                <View style={styles.visionIcon}>
                  <Feather name="eye" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visionLabel}>Our Vision</Text>
                  <Text style={[styles.visionText, { color: C.text }]}>{vision}</Text>
                </View>
              </View>
            </Section>
          )}

          {/* Mission */}
          {!!mission && (
            <Section>
              <View style={[styles.visionCard, { backgroundColor: C.card, borderLeftColor: COLORS.secondary }]}>
                <View style={[styles.visionIcon, { backgroundColor: COLORS.secondary + '18' }]}>
                  <Feather name="target" size={20} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.visionLabel, { color: COLORS.secondary }]}>Our Mission</Text>
                  <Text style={[styles.visionText, { color: C.text }]}>{mission}</Text>
                </View>
              </View>
            </Section>
          )}

          {/* Contact details from company record */}
          {(!!address || !!email || !!phone) && (
            <Section title="Contact" titleColor={C.title}>
              {!!address && (
                <View style={[styles.contactRow, { backgroundColor: C.card }]}>
                  <Feather name="map-pin" size={16} color={COLORS.primary} />
                  <Text style={[styles.contactTxt, { color: C.text }]}>{address}</Text>
                </View>
              )}
              {!!phone && (
                <View style={[styles.contactRow, { backgroundColor: C.card }]}>
                  <Feather name="phone" size={16} color={COLORS.primary} />
                  <Text style={[styles.contactTxt, { color: C.text }]}>{phone}</Text>
                </View>
              )}
              {!!email && (
                <View style={[styles.contactRow, { backgroundColor: C.card }]}>
                  <Feather name="mail" size={16} color={COLORS.primary} />
                  <Text style={[styles.contactTxt, { color: C.text }]}>{email}</Text>
                </View>
              )}
            </Section>
          )}

          {/* Fallback if API returned nothing useful */}
          {!description && !vision && !mission && (
            <Section>
              <Text style={[styles.bodyText, { color: C.text }]}>
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
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold },
  scroll: { paddingBottom: 40 },
  // Hero
  hero: {
    alignItems: 'center', paddingVertical: 32, paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
  },
  logo: { width: 120, height: 80, marginBottom: 16 },
  logoPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  brandName: { fontFamily: 'MarcellusRegular', fontSize: 26, textAlign: 'center' },
  tagline: { ...FONTS.fontSm, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  estBadge: {
    marginTop: 12, backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
  },
  estTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.primary },
  // Sections
  section: { marginTop: 20, paddingHorizontal: SIZES.padding },
  secTitle: { fontFamily: 'MarcellusRegular', fontSize: 18, marginBottom: 10 },
  bodyText: { ...FONTS.font, lineHeight: 24 },
  // Vision / Mission
  visionCard: {
    flexDirection: 'row', gap: 12,
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
  visionText: { ...FONTS.fontSm, lineHeight: 20 },
  // Contact
  contactRow: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  contactTxt: { flex: 1, ...FONTS.fontSm, lineHeight: 20 },
});

export default AboutUs;
