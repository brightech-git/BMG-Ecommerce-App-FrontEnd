// app/Screens/profile/Profile.tsx
// Website: /account (Dashboard). Shows user + menu to orders/addresses/profile/logout.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useProfile } from '../../api/hooks/useProfile';
import { useAuthToken } from '../../api/hooks/useAuthToken';
import { logout } from '../../redux/reducer/authReducer';
import { EmptyState } from '../../components/common/StateViews';

type Nav = StackNavigationProp<RootStackParamList>;

const Row = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.rowIcon, danger && { backgroundColor: 'rgba(255,49,49,0.08)' }]}>
      <Feather name={icon} size={18} color={danger ? COLORS.danger : COLORS.primary} />
    </View>
    <Text style={[styles.rowLabel, danger && { color: COLORS.danger }]}>{label}</Text>
    {!danger && <Feather name="chevron-right" size={18} color={COLORS.textLight} />}
  </TouchableOpacity>
);

const Profile = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useDispatch<any>();
  const token = useAuthToken();
  const { profile } = useProfile();

  const u: any = profile ?? {};
  const name = u.username || u.name || u.customerName || 'Guest';
  const email = u.email || '';
  const phone = u.contactNumber || u.contact || u.phone || '';

  const doLogout = () => Alert.alert('Log out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Log out', style: 'destructive',
      onPress: () => {
        dispatch(logout());
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] }));
      },
    },
  ]);

  if (!token) {
    return (
      <View style={styles.safe}>
        <View style={styles.header}><Text style={styles.hTitle}>Account</Text></View>
        <EmptyState icon="user" title="You're not signed in"
          subtitle="Sign in to view your profile, orders and addresses."
          ctaLabel="Sign In" onCta={() => navigation.navigate('SignIn')} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}><Text style={styles.hTitle}>Account</Text></View>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{name.charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            {!!email && <Text style={styles.sub}>{email}</Text>}
            {!!phone && <Text style={styles.sub}>{phone}</Text>}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Feather name="edit-2" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.group}>
          <Row icon="shopping-bag" label="My Orders" onPress={() => navigation.navigate('Myorder')} />
          <Row icon="map-pin" label="My Addresses" onPress={() => navigation.navigate('SavedAddresses', {})} />
          <Row icon="heart" label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <Row icon="bell" label="Notifications" onPress={() => navigation.navigate('Notification')} />
        </View>

        <View style={styles.group}>
          <Row icon="user" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
          <Row icon="globe" label="Language" onPress={() => navigation.navigate('Language')} />
        </View>

        <View style={styles.group}>
          <Row icon="log-out" label="Log Out" danger onPress={doLogout} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: { paddingHorizontal: SIZES.padding, paddingVertical: 14, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  hTitle: { ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white,
    margin: SIZES.padding, padding: 16, borderRadius: 14, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { ...FONTS.h4, color: COLORS.white },
  name: { ...FONTS.h6, ...FONTS.fontSemiBold, color: COLORS.title },
  sub: { ...FONTS.fontSm, color: COLORS.textLight, marginTop: 1 },
  group: { backgroundColor: COLORS.white, marginHorizontal: SIZES.padding, marginBottom: 14, borderRadius: 14, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.borderColor },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, ...FONTS.font, ...FONTS.fontMedium, color: COLORS.title },
});

export default Profile;
