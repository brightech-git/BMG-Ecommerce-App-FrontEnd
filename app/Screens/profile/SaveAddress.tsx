// app/Screens/profile/SaveAddress.tsx
// Website AddressModal field names (exact): name, phone, addressLine, locality,
// city, state, pincode, landmark, alternatePhone, gstNumber, companyName, isDefault.
// Pincode is validated against DTDC serviceability API before saving.
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useAddresses } from '../../api/hooks/useAddresses';
import { getAddressById } from '../../api/services/addressService';
import { toastError } from '../../utils/toast';
import { axiosInstance } from '../../api/axiosInstance';
import { SHIPPING } from '../../api/endpoints';

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

type PincodeStatus = 'idle' | 'checking' | 'ok' | 'unavailable' | 'error';

// Helper: extract message string from any response shape
const pickMsg = (d: any): string | null =>
  d?.message ?? d?.data?.message ?? d?.msg ?? d?.description ?? null;

// Helper: decide if the response body means "serviceable"
const isServiceable = (d: any): boolean => {
  if (d?.serviceable === true) return true;
  if (d?.data?.serviceable === true) return true;
  if (d?.available === true) return true;
  if (d?.isServiceable === true) return true;
  if (d?.status === 'serviceable') return true;
  const msg = (pickMsg(d) ?? '').toLowerCase();
  if (!msg) return false;
  return msg.includes('serviceable') && !msg.includes('not serviceable');
};

const Field = ({ label, value, onChange, keyboardType, required, onBlur }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
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

  // Pincode serviceability state
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>('idle');
  const [pincodeMessage, setPincodeMessage] = useState('');
  const lastCheckedPin = useRef('');

  useEffect(() => {
    if (!editId) return;
    getAddressById(editId).then((res: any) => {
      const a = res?.data ?? res;
      if (a) {
        setForm({ ...EMPTY, ...a, addressType: a.addressType ?? 'Home' });
        // If editing, mark existing pincode as already ok (it was previously saved)
        if (a.pincode && String(a.pincode).length === 6) {
          lastCheckedPin.current = String(a.pincode);
          setPincodeStatus('ok');
          setPincodeMessage('Delivery available to this pincode');
        }
      }
    }).catch(() => {});
  }, [editId]);

  const checkPincode = async (pin: string) => {
    const p = pin.trim();
    if (p.length !== 6 || !/^\d{6}$/.test(p)) {
      setPincodeStatus('idle');
      setPincodeMessage('');
      return;
    }
    if (lastCheckedPin.current === p && pincodeStatus === 'ok') return;

    lastCheckedPin.current = p;
    setPincodeStatus('checking');
    setPincodeMessage('');

    try {
      // Use axiosInstance directly so we can read the body on non-2xx responses too
      const res = await axiosInstance.get(SHIPPING.PINCODE_SERVICEABILITY, {
        params: { destPincode: p },
      });
      const data = res.data;

      // On a 200 response, treat as serviceable UNLESS the body explicitly says otherwise
      const explicitlyNotServiceable =
        data?.serviceable === false ||
        data?.data?.serviceable === false ||
        data?.available === false ||
        data?.isServiceable === false ||
        (typeof pickMsg(data) === 'string' &&
          pickMsg(data)!.toLowerCase().includes('not serviceable'));

      if (!explicitlyNotServiceable) {
        setPincodeStatus('ok');
        setPincodeMessage(pickMsg(data) ?? 'Delivery available to this pincode');
      } else {
        setPincodeStatus('unavailable');
        setPincodeMessage(pickMsg(data) ?? 'Sorry, delivery is not available to this pincode');
      }
    } catch (e: any) {
      // Non-2xx — the backend may still return a JSON body with serviceability info
      const data = e?.response?.data;

      if (data != null) {
        // Explicit false → not available
        if (data?.serviceable === false || data?.available === false) {
          setPincodeStatus('unavailable');
          setPincodeMessage(pickMsg(data) ?? 'Sorry, delivery is not available to this pincode');
          return;
        }
        // Any other non-null body → inspect message text
        const msg: string = pickMsg(data) ?? '';
        const lower = msg.toLowerCase();
        if (lower.includes('not serviceable') || lower.includes('not available') || lower.includes('unavailable')) {
          setPincodeStatus('unavailable');
          setPincodeMessage(msg || 'Sorry, delivery is not available to this pincode');
          return;
        }
        if (lower.includes('serviceable') || lower.includes('available')) {
          setPincodeStatus('ok');
          setPincodeMessage(msg || 'Delivery available to this pincode');
          return;
        }
      }
      setPincodeStatus('error');
      setPincodeMessage('Could not verify pincode. Please try again.');
    }
  };

  // Auto-check when pincode reaches 6 digits
  const onPincodeChange = (v: string) => {
    set('pincode')(v);
    if (v.length === 6 && /^\d{6}$/.test(v)) {
      checkPincode(v);
    } else {
      // Reset if user edits below 6 digits
      setPincodeStatus('idle');
      setPincodeMessage('');
      lastCheckedPin.current = '';
    }
  };

  const onSave = () => {
    if (!form.name.trim() || !form.phone.trim() || !form.pincode.trim() || !form.addressLine.trim() || !form.city.trim() || !form.state.trim()) {
      toastError('Please fill name, phone, address, city, state and pincode');
      return;
    }
    if (pincodeStatus === 'checking') {
      toastError('Please wait while we verify your pincode');
      return;
    }
    if (pincodeStatus === 'unavailable') {
      toastError('Delivery is not available to this pincode. Please use a serviceable pincode.');
      return;
    }
    if (pincodeStatus === 'error') {
      toastError('Could not verify pincode serviceability. Please check your connection and try again.');
      return;
    }
    if (pincodeStatus === 'idle' && form.pincode.trim().length === 6) {
      // Trigger check first
      checkPincode(form.pincode);
      toastError('Please wait while we verify your pincode');
      return;
    }
    const done = () => navigation.goBack();
    if (editId) updateAddress({ id: editId, data: form }, { onSuccess: done });
    else createAddress(form, { onSuccess: done });
  };

  const isSaveDisabled = isCreating || isUpdating || pincodeStatus === 'checking' || pincodeStatus === 'unavailable';

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

        {/* Pincode with serviceability check */}
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Pincode *</Text>
          <View style={styles.pincodeRow}>
            <TextInput
              style={[styles.input, styles.pincodeInput,
                pincodeStatus === 'ok' && styles.inputSuccess,
                pincodeStatus === 'unavailable' && styles.inputError,
              ]}
              value={form.pincode}
              onChangeText={onPincodeChange}
              onBlur={() => form.pincode.trim().length === 6 && checkPincode(form.pincode)}
              keyboardType="number-pad"
              placeholder="6-digit pincode"
              placeholderTextColor={COLORS.placeholder}
              maxLength={6}
            />
            {pincodeStatus === 'checking' && (
              <View style={styles.pincodeIcon}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
            {pincodeStatus === 'ok' && (
              <View style={styles.pincodeIcon}>
                <Feather name="check-circle" size={18} color="#22c55e" />
              </View>
            )}
            {(pincodeStatus === 'unavailable' || pincodeStatus === 'error') && (
              <View style={styles.pincodeIcon}>
                <Feather name="x-circle" size={18} color={COLORS.danger} />
              </View>
            )}
          </View>
          {pincodeMessage !== '' && (
            <Text style={[styles.pincodeMsg,
              pincodeStatus === 'ok' ? styles.pincodeMsgOk : styles.pincodeMsgErr]}>
              {pincodeMessage}
            </Text>
          )}
          {pincodeStatus === 'idle' && form.pincode.length > 0 && form.pincode.length < 6 && (
            <Text style={styles.pincodeHint}>Enter 6-digit pincode to check delivery availability</Text>
          )}
        </View>

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

        <TouchableOpacity
          style={[styles.saveBtn, isSaveDisabled && { opacity: 0.6 }]}
          disabled={isSaveDisabled}
          onPress={onSave}>
          <Text style={styles.saveTxt}>
            {isCreating || isUpdating ? 'Saving...' : pincodeStatus === 'checking' ? 'Verifying Pincode...' : 'Save Address'}
          </Text>
        </TouchableOpacity>

        {pincodeStatus === 'unavailable' && (
          <Text style={styles.unavailableNote}>
            We currently do not deliver to this pincode. Please use a different delivery address.
          </Text>
        )}
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
  pincodeRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  pincodeInput: { flex: 1, paddingRight: 40 },
  inputSuccess: { borderColor: '#22c55e' },
  inputError: { borderColor: COLORS.danger },
  pincodeIcon: { position: 'absolute', right: 12 },
  pincodeMsg: { marginTop: 5, ...FONTS.fontXs },
  pincodeMsgOk: { color: '#16a34a' },
  pincodeMsgErr: { color: COLORS.danger },
  pincodeHint: { marginTop: 5, ...FONTS.fontXs, color: COLORS.textLight },
  typeRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 20 },
  typeChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.borderColor, backgroundColor: COLORS.white },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeTxt: { ...FONTS.fontSm, color: COLORS.text },
  typeTxtActive: { color: COLORS.white },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius_lg, paddingVertical: 15, alignItems: 'center' },
  saveTxt: { ...FONTS.fontLg, ...FONTS.fontSemiBold, color: COLORS.white },
  unavailableNote: { marginTop: 12, textAlign: 'center', ...FONTS.fontSm, color: COLORS.danger, lineHeight: 20 },
});

export default SaveAddress;
