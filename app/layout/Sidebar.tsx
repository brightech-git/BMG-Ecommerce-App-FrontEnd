// app/layout/Sidebar.tsx
// Enhanced drawer sidebar — logo, real user info, grouped nav, logout.
import React from 'react';
import {
  Image, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { COLORS, FONTS } from '../constants/theme';
import { IMAGES } from '../constants/Images';
import { useTheme } from '../context/ThemeContext';
import { closeDrawer } from '../redux/actions/drawerAction';
import { logout } from '../redux/reducer/authReducer';
import { AsyncStorageHelper } from '../utils/AsyncStorageHelper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/* ─── nav group definition ─────────────────────────────────────── */
interface NavItem { icon: string; label: string; route: string }
interface NavGroup { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Explore',
    items: [
      { icon: 'home',   label: 'Home',       route: 'BottomNavigation' },
      { icon: 'grid',   label: 'Categories', route: 'Category' },
      { icon: 'tag',    label: 'Offers',     route: 'Offers' },
      { icon: 'search', label: 'Search',     route: 'Search' },
    ],
  },
  {
    title: 'Help & Support',
    items: [
      { icon: 'help-circle', label: 'Help & Info', route: 'HelpCenter' },
      { icon: 'phone',       label: 'Contact Us',  route: 'ContactUs' },
      { icon: 'info',        label: 'About Us',    route: 'AboutUs' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: 'shield',    label: 'Privacy Policy',     route: 'PolicyScreen' },
      { icon: 'file-text', label: 'Terms & Conditions', route: 'PolicyScreen' },
    ],
  },
];

const POLICY_PARAMS: Record<string, any> = {
  'Privacy Policy':     { type: 'privacy' },
  'Terms & Conditions': { type: 'terms' },
};

/* ─── component ────────────────────────────────────────────────── */
const Sidebar = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { colors: C, isDark, toggleTheme } = useTheme();
  const user = useSelector((s: any) => s.auth?.user);

  const name     = user?.username || user?.name || 'Guest';
  const email    = user?.email   || '';
  const picture  = user?.picture || null;
  const initials = name.charAt(0).toUpperCase();

  const go = (route: string, params?: any) => {
    navigation.closeDrawer();
    dispatch(closeDrawer());
    navigation.dispatch(CommonActions.navigate({ name: route, params }));
  };

  const handleLogout = async () => {
    navigation.closeDrawer();
    dispatch(closeDrawer());
    try { await GoogleSignin.signOut(); } catch { }
    await AsyncStorageHelper.clearSession();
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] })
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} />

      {/* ── Top bar: logo + close ──────────────────────────────── */}
      {/* <View style={[styles.topBar, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <Image source={IMAGES.logo} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: C.background }]}
          onPress={() => { navigation.closeDrawer(); dispatch(closeDrawer()); }}
        >
          <Feather name="x" size={20} color={C.title} />
        </TouchableOpacity>
      </View> */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* ── User card ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}
          activeOpacity={0.8}
          onPress={() => go('Profile')}
        >
          {picture
            ? <Image source={{ uri: picture }} style={styles.avatar} />
            : (
              <View style={[styles.avatar, styles.avatarInitial, { backgroundColor: C.primary }]}>
                <Text style={[styles.avatarTxt, { color: C.white }]}>{initials}</Text>
              </View>
            )
          }
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: C.title }]}>{name}</Text>
            {!!email && (
              <Text style={[styles.userEmail, { color: C.textLight }]} numberOfLines={1}>{email}</Text>
            )}
            <Text style={[styles.viewProfile, { color: C.primary }]}>View Profile →</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.textLight} />
        </TouchableOpacity>

        {/* ── Nav groups ────────────────────────────────────────── */}
        {NAV_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[styles.groupTitle, { color: C.textLight }]}>
              {group.title.toUpperCase()}
            </Text>
            <View style={[styles.groupCard, { backgroundColor: C.card }]}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.navRow,
                    { borderBottomColor: C.borderColor },
                    idx === group.items.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => go(item.route, POLICY_PARAMS[item.label])}
                >
                  <View style={[styles.navIcon, { backgroundColor: C.primaryLight }]}>
                    <Feather name={item.icon as any} size={16} color={C.primary} />
                  </View>
                  <Text style={[styles.navLabel, { color: C.title }]}>{item.label}</Text>
                  <Feather name="chevron-right" size={15} color={C.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Preferences (dark/light mode) ─────────────────────── */}
        <View style={styles.group}>
          <Text style={[styles.groupTitle, { color: C.textLight }]}>PREFERENCES</Text>
          <View style={[styles.groupCard, { backgroundColor: C.card }]}>
            <TouchableOpacity
              style={[styles.navRow, { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={toggleTheme}
            >
              <View style={[styles.navIcon, { backgroundColor: C.primaryLight }]}>
                <Feather name={isDark ? 'sun' : 'moon'} size={16} color={C.primary} />
              </View>
              <Text style={[styles.navLabel, { color: C.title }]}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Text>
              <Feather name="chevron-right" size={15} color={C.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Logout ────────────────────────────────────────────── */}
        <View style={[styles.group, { marginTop: 4 }]}>
          <TouchableOpacity
            style={[styles.logoutBtn, {
              backgroundColor: 'rgba(255,49,49,0.08)',
              borderColor: 'rgba(255,49,49,0.2)',
            }]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={18} color={C.danger} />
            <Text style={[styles.logoutTxt, { color: C.danger }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={[styles.footerTxt, { color: C.textLight }]}>BMG Jewellers</Text>
          <Text style={[styles.footerSub, { color: C.textLight }]}>App Version 1.0</Text>
        </View>

      </ScrollView>
    </View>
  );
};

/* ─── styles ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo:     { width: 120, height: 46 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  avatar:        { width: 52, height: 52, borderRadius: 26 },
  avatarInitial: { alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { ...FONTS.h5, fontWeight: '700' },
  userName:      { ...FONTS.font, ...FONTS.fontSemiBold },
  userEmail:     { ...FONTS.fontSm, marginTop: 1 },
  viewProfile:   { ...FONTS.fontXs, fontWeight: '600', marginTop: 4 },

  group:      { marginHorizontal: 16, marginBottom: 12 },
  groupTitle: {
    ...FONTS.fontXs, fontWeight: '700', letterSpacing: 1,
    marginBottom: 6, marginLeft: 4,
  },
  groupCard: {
    borderRadius: 14, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },

  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navIcon:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, ...FONTS.font },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1,
  },
  logoutTxt: { ...FONTS.font, ...FONTS.fontSemiBold },

  footer:    { alignItems: 'center', paddingTop: 8 },
  footerTxt: { ...FONTS.fontSm, ...FONTS.fontSemiBold },
  footerSub: { ...FONTS.fontXs, marginTop: 2 },
});

export default Sidebar;
