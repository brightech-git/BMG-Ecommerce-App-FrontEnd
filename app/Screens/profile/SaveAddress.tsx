// app/Screens/profile/SaveAddress.tsx
// Website AddressModal field names (exact): name, phone, addressLine, locality,
// city, state, pincode, landmark, alternatePhone, gstNumber, companyName, isDefault.
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAddresses } from '../../api/hooks/useAddresses';
import { getAddressById } from '../../api/services/addressService';
import { toastError } from '../../utils/toast';

type Props = StackScreenProps<RootStackParamList, 'SaveAddress'>;

type Form = {
  name: string; phone: string; addressLine: string; locality: string;
  city: string; state: string; pincode: string; landmark: string;
  alternatePhone: string; addressType: string;
};
const EMPTY: Form = {
  name: '', phone: '', addressLine: '', locality: '', city: '', state: '',
  pincode: '', landmark: '', alternatePhone: '', addressType: 'Home',
};

const Field = ({ label, value, onChange, keyboardType, required }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholder={label}
      placeholderTextColor={COLORS.placeholder}
    />
  </View>
);

const SaveAddress = ({ route, navigation }: Props) => {
  const editId = route.params?.id;
  const { createAddress, updateAddress, isCreating, isUpdating } = useAddresses();
  const [form, setForm] = useState<Form>(EMPTY);
  const set = (k: keyof Form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!editId) return;
    getAddressById(editId).then((res: any) => {
      const a = res?.data ?? res;
      if (a) setForm({ ...EMPTY, ...a, addressType: a.addressType ?? 'Home' });
    }).catch(() => {});
  }, [editId]);

  const onSave = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.pincode.trim() || !form.addressLine.trim() || !form.city.trim() || !form.state.trim()) {
      toastError('Please fill name, phone, address, city, state and pincode');
      return;
    }
    const done = () => navigation.goBack();
    if (editId) updateAddress({ id: editId, data: form }, { onSuccess: done });
    else createAddress(form, { onSuccess: done });
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.hTitle}>{editId ? 'Edit Address' : 'Add Address'}</Text>
        <View style={styles.hBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.padding, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Field label="Full Name" value={form.name} onChange={set('name')} required />
        <Field label="Phone" value={form.phone} onChange={set('phone')} keyboardType="phone-pad" required />
        <Field label="Address" value={form.addressLine} onChange={set('addressLine')} required />
        <Field label="Locality / Area" value={form.locality} onChange={set('locality')} />
        <Field label="Pincode" value={form.pincode} onChange={set('pincode')} keyboardType="number-pad" required />
        <Field label="City" value={form.city} onChange={set('city')} required />
        <Field label="State" value={form.state} onChange={set('state')} required />
        <Field label="Landmark" value={form.landmark} onChange={set('landmark')} />
        <Field label="Alternate Phone" value={form.alternatePhone} onChange={set('alternatePhone')} keyboardType="phone-pad" />

        <Text style={styles.label}>Address Type</Text>
        <View style={styles.typeRow}>
          {['Home', 'Work', 'Other'].map((t) => (
            <TouchableOpacity key={t} style={[styles.typeChip, form.addressType === t && styles.typeChipActive]}
              onPress={() => set('addressType')(t)}>
              <Text style={[styles.typeTxt, form.addressType === t && styles.typeTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} disabled={isCreating || isUpdating} onPress={onSave}>
          <Text style={styles.saveTxt}>{isCreating || isUpdating ? 'Saving...' : 'Save Address'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9F6F1' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  hBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  hTitle: { flex: 1, ...FONTS.h5, ...FONTS.fontSemiBold, color: COLORS.title },
  label: { ...FONTS.fontSm, ...FONTS.fontSemiBold, color: COLORS.title, marginBottom: 6 },
  input: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.borderColor,
    borderRadius: SIZES.radius, paddingHorizontal: 14, paddingVertical: 12, ...FONTS.font, color: COLORS.title },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 20 },
  typeChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.borderColor, backgroundColor: COLORS.white },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeTxt: { ...FONTS.fontSm, color: COLORS.text },
  typeTxtActive: { color: COLORS.white },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center' },
  saveTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
});

export default SaveAddress;
