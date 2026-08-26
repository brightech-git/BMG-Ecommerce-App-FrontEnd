// app/Screens/profile/Profile.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Alert, Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../api/hooks/useProfile';
import { useAuthToken } from '../../api/hooks/useAuthToken';
import { logout } from '../../redux/reducer/authReducer';
import { EmptyState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;

const Profile = () => {
  const navigation  = useNavigation<Nav>();
  const dispatch    = useDispatch<any>();
  const token       = useAuthToken();
  const { profile } = useProfile();
  const { isDark, colors: C, toggleTheme } = useTheme();

  const u     = (profile ?? {}) as any;
  const name  = u.username || u.name || u.customerName || 'Guest';
  const email = u.email || '';
  const phone = u.contactNumber || u.contact || u.phone || '';

  const doLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: () => {
          dispatch(logout());
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] }));
        },
      },
    ]);

  const SectionLabel = ({ title }: { title: string }) => (
    <Text style={[styles.sectionLabel, { color: C.textLight }]}>{title.toUpperCase()}</Text>
  );

  const Row = ({ icon, label, onPress, danger, right }: any) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: C.borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? 'rgba(255,49,49,0.08)' : C.primaryLight }]}>
        <Feather name={icon} size={18} color={danger ? C.danger : C.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? C.danger : C.title }]}>{label}</Text>
      {right ?? (!danger && <Feather name="chevron-right" size={18} color={C.textLight} />)}
    </TouchableOpacity>
  );

  if (!token) {
    return (
      <View style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
          <Text style={[styles.hTitle, { color: C.title }]}>Account</Text>
        </View>
        <EmptyState icon="user" title="You're not signed in"
          subtitle="Sign in to view your profile, orders and addresses."
          ctaLabel="Sign In" onCta={() => navigation.navigate('SignIn')} />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <Text style={[styles.hTitle, { color: C.title }]}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SIZES.TAB_BAR_HEIGHT }}>
        <View style={[styles.profileCard, { backgroundColor: C.card }]}>
          <View style={[styles.avatar, { backgroundColor: C.primary }]}>
            <Text style={[styles.avatarTxt, { color: C.white }]}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: C.title }]}>{name}</Text>
            {!!email && <Text style={[styles.sub, { color: C.textLight }]}>{email}</Text>}
            {!!phone && <Text style={[styles.sub, { color: C.textLight }]}>{phone}</Text>}
          </View>
          {/* Edit profile button — uncomment when edit screen is ready
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="edit-2" size={18} color={C.primary} />
          </TouchableOpacity>
          */}
        </View>

        <SectionLabel title="My Activity" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          <Row icon="shopping-bag"  label="My Orders"     onPress={() => navigation.navigate('Myorder')} />
          <Row icon="heart"         label="Wishlist"      onPress={() => navigation.navigate('Wishlist')} />
          <Row icon="shopping-cart" label="Cart"       onPress={() => navigation.navigate('MyCart')} />
          {/* <Row icon="tag"           label="Offers & Deals" onPress={() => navigation.navigate('Offers')} /> */}
        </View>

        <SectionLabel title="My Account" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          <Row icon="map-pin" label="My Addresses"  onPress={() => navigation.navigate('SavedAddresses', {})} />
          <Row icon="bell"    label="Notifications" onPress={() => navigation.navigate('Notification')} />
        </View>

        <SectionLabel title="Settings" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          {/* Edit Profile — uncomment when edit screen is ready
          <Row icon="user" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          */}
          <Row icon="lock"  label="Change Password" onPress={() => navigation.navigate('ChangePassword')} />
          {/* Language — uncomment when multi-language is supported
          <Row icon="globe" label="Language" onPress={() => navigation.navigate('Language')} />
          */}
          <Row
            icon={isDark ? 'moon' : 'sun'}
            label={isDark ? 'Dark Mode' : 'Light Mode'}
            onPress={toggleTheme}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: C.borderColor, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />
        </View>

        <SectionLabel title="Account" />
        <View style={[styles.group, { backgroundColor: C.card }]}>
          <Row icon="log-out" label="Log Out" danger onPress={doLogout} />
          <Row icon="trash-2" label="Delete Account" danger onPress={() => navigation.navigate('DeleteAccount')} />
        </View>

        {/* Powered by */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 12, color: C.textLight }}>Powered by</Text>
          <Text style={{ fontSize: 14, color: C.textLight, fontWeight: '700', marginTop: 2 }}>
            Brightech Software Services Pvt Ltd
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  header:      { paddingHorizontal: SIZES.padding, paddingVertical: 14, borderBottomWidth: 1 },
  hTitle:      { ...FONTS.h5, ...FONTS.fontSemiBold },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, margin: SIZES.padding, padding: 16, borderRadius: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  avatar:      { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:   { ...FONTS.h4 },
  name:        { ...FONTS.h6, ...FONTS.fontSemiBold },
  sub:         { ...FONTS.fontSm, marginTop: 1 },
  sectionLabel: { marginHorizontal: SIZES.padding + 4, marginBottom: 6, marginTop: 4, ...FONTS.fontXs, fontWeight: '700', letterSpacing: 1 },
  group:       { marginHorizontal: SIZES.padding, marginBottom: 14, borderRadius: 14, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowLabel:    { flex: 1, ...FONTS.font, ...FONTS.fontMedium },
});

export default Profile;
