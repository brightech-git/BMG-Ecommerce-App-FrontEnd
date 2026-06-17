import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {changePasswordService} from '../../services/AuthService';
import {colors} from '../../theme/theme';

// ── Menu row ──────────────────────────────────────────────────────────────────
const MenuItem = ({icon, label, sublabel, onPress, danger, rightLabel}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && {color: colors.error}]}>{label}</Text>
      {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
    </View>
    {rightLabel ? (
      <Text style={styles.menuRight}>{rightLabel}</Text>
    ) : (
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
    )}
  </TouchableOpacity>
);

// ── AccountScreen ─────────────────────────────────────────────────────────────
const AccountScreen = ({navigation}) => {
  const {user, logout, isAuthenticated} = useAuth();
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    const e = {};
    if (!oldPw) e.oldPw = 'Enter current password';
    if (!newPw || newPw.length < 6) e.newPw = 'Minimum 6 characters';
    if (Object.keys(e).length) {setErrors(e); return;}

    setPwLoading(true);
    try {
      await changePasswordService({oldPassword: oldPw, newPassword: newPw});
      Toast.show({type: 'success', text1: 'Password changed!'});
      setOldPw('');
      setNewPw('');
      setChangePwOpen(false);
      setErrors({});
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: err.message || 'Could not change password',
      });
    } finally {
      setPwLoading(false);
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <View style={styles.centered}>
          <Text style={{fontSize: 56, marginBottom: 16}}>👤</Text>
          <Text style={styles.emptyTitle}>You're not signed in</Text>
          <Text style={styles.emptySub}>Sign in to access your account</Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.actionBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    user?.username ?? user?.name ?? user?.email ?? 'BMG Customer';
  const email = user?.email ?? '';
  const contact = user?.contactNumber ?? user?.mobileNumber ?? '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{width: 22}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(displayName[0] ?? 'B').toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {email ? <Text style={styles.profileSub}>{email}</Text> : null}
            {contact ? <Text style={styles.profileSub}>{contact}</Text> : null}
          </View>
        </View>

        {/* Orders section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY ORDERS</Text>
          <MenuItem
            icon="receipt-outline"
            label="Order History"
            sublabel="View all past orders"
            onPress={() => navigation.navigate('OrderHistory')}
          />
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY ADDRESSES</Text>
          <MenuItem
            icon="location-outline"
            label="Saved Addresses"
            sublabel="Manage delivery addresses"
            onPress={() => navigation.navigate('Address')}
          />
        </View>

        {/* Favourites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY COLLECTION</Text>
          <MenuItem
            icon="heart-outline"
            label="Wishlist"
            sublabel="Your saved items"
            onPress={() => navigation.navigate('Wishlist')}
          />
          <MenuItem
            icon="time-outline"
            label="Recently Viewed"
            sublabel="Items you browsed"
            onPress={() => navigation.navigate('Home')}
          />
        </View>

        {/* Account settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>

          {/* Change password inline */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setChangePwOpen(v => !v)}
            activeOpacity={0.75}>
            <View style={styles.menuIcon}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Change Password</Text>
            </View>
            <Ionicons
              name={changePwOpen ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.textLight}
            />
          </TouchableOpacity>

          {changePwOpen && (
            <View style={styles.changePwForm}>
              {/* Old password */}
              <Text style={styles.fieldLabel}>Current Password</Text>
              <View style={[styles.inputWrap, errors.oldPw && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Current password"
                  placeholderTextColor={colors.placeholder}
                  value={oldPw}
                  onChangeText={v => {setOldPw(v); if (errors.oldPw) setErrors(e => ({...e, oldPw: undefined}));}}
                  secureTextEntry={!showOld}
                />
                <TouchableOpacity onPress={() => setShowOld(v => !v)}>
                  <Ionicons
                    name={showOld ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
              {errors.oldPw ? <Text style={styles.errText}>{errors.oldPw}</Text> : null}

              {/* New password */}
              <Text style={[styles.fieldLabel, {marginTop: 12}]}>New Password</Text>
              <View style={[styles.inputWrap, errors.newPw && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.placeholder}
                  value={newPw}
                  onChangeText={v => {setNewPw(v); if (errors.newPw) setErrors(e => ({...e, newPw: undefined}));}}
                  secureTextEntry={!showNew}
                />
                <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                  <Ionicons
                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.textLight}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPw ? <Text style={styles.errText}>{errors.newPw}</Text> : null}

              <TouchableOpacity
                style={[styles.savePwBtn, pwLoading && {opacity: 0.65}]}
                onPress={handleChangePassword}
                disabled={pwLoading}>
                {pwLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.savePwBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            danger
            onPress={handleLogout}
          />
        </View>

        {/* App version */}
        <Text style={styles.versionText}>BMG Jewellers v1.0.0</Text>
        <View style={{height: 32}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: colors.background},
  header: {
    backgroundColor: colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  avatarText: {fontSize: 26, fontWeight: '900', color: colors.white},
  profileInfo: {flex: 1},
  profileName: {fontSize: 17, fontWeight: '800', color: colors.white, marginBottom: 3},
  profileSub: {fontSize: 12, color: colors.primaryLight, lineHeight: 18},

  section: {
    backgroundColor: colors.surface,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {backgroundColor: '#FFEBEE'},
  menuContent: {flex: 1},
  menuLabel: {fontSize: 14, fontWeight: '600', color: colors.text},
  menuSublabel: {fontSize: 11, color: colors.textSecondary, marginTop: 1},
  menuRight: {fontSize: 12, color: colors.textSecondary},

  changePwForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: {fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 12, marginBottom: 6},
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
  },
  inputError: {borderColor: colors.error},
  input: {flex: 1, fontSize: 14, color: colors.text},
  errText: {fontSize: 11, color: colors.error, marginTop: 3},
  savePwBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  savePwBtnText: {fontSize: 14, fontWeight: '700', color: colors.white},

  centered: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32},
  emptyTitle: {fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6},
  emptySub: {fontSize: 13, color: colors.textSecondary, marginBottom: 24, textAlign: 'center'},
  actionBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  actionBtnText: {fontSize: 14, fontWeight: '700', color: colors.white},

  versionText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
});
