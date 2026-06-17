// app/Screens/profile/EditProfile.tsx
// Website: account profile edit. Data: /user/profile + /auth/user/update/:id.
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useProfile, useUpdateProfile } from '../../api/hooks/useProfile';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { Loader } from '../../components/common/StateViews';
import { toastError } from '../../utils/toast';

type Nav = StackNavigationProp<RootStackParamList>;

const EditProfile = () => {
  const navigation = useNavigation<Nav>();
  const { profile, isLoading } = useProfile();
  const { mutate: update, isPending } = useUpdateProfile();

  const [form, setForm] = useState({ username: '', email: '', contactNumber: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { AsyncStorageHelper.getUserId().then((v) => setUserId(v ?? null)); }, []);
  useEffect(() => {
    const u: any = profile ?? {};
    if (u) setForm({
      username: u.username || u.name || '',
      email: u.email || '',
      contactNumber: u.contactNumber || u.contact || '',
    });
  }, [profile]);

  const onSave = () => {
    if (!userId) { toastError('Unable to identify user'); return; }
    if (!form.username.trim()) { toastError('Name is required'); return; }
    update({ id: userId, updatedData: form }, { onSuccess: () => navigation.goBack() });
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>Edit Profile</Text>
        <View style={styles.hBtn} />
      </View>

      {isLoading ? <Loader message="Loading..." /> : (
        <ScrollView contentContainerStyle={{ padding: SIZES.padding }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} value={form.username} onChangeText={set('username')} placeholder="Full Name" placeholderTextColor={COLORS.placeholder} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholder="Email" placeholderTextColor={COLORS.placeholder} />
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={form.contactNumber} onChangeText={set('contactNumber')} keyboardType="phone-pad" placeholder="Phone" placeholderTextColor={COLORS.placeholder} />
          <TouchableOpacity style={styles.saveBtn} disabled={isPending} onPress={onSave}>
            <Text style={styles.saveTxt}>{isPending ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  label: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 12, ...FONTS.font, color: COLORS.title },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center', marginTop: 26 },
  saveTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default EditProfile;
