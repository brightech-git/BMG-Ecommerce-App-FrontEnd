/**
 * AddressScreen — Full address CRUD with GPS "Use My Location" support.
 * Mirrors the website's AddressModal + GeoLocationPicker pattern.
 *
 * Flow: Get GPS coords → call /addresses/geocode → auto-fill form fields.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import {useAuth} from '../../context/AuthContext';
import {
  useAddressesByCustomer,
  useAddressByLocation,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from '../../hooks/useAddress';
import {colors, fonts, radius, shadows} from '../../theme/theme';

const INITIAL_FORM = {
  name: '',
  phone: '',
  addressLine: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  locality: '',
  landmark: '',
  alternatePhone: '',
  companyName: '',
  gstNumber: '',
  isDefault: false,
  latitude: null,
  longitude: null,
};

// ── Address Card ─────────────────────────────────────────────────────────────
const AddressCard = ({address, isSelected, onSelect, onEdit, onDelete}) => (
  <TouchableOpacity
    style={[styles.card, isSelected && styles.cardSelected]}
    onPress={() => onSelect(address)}
    activeOpacity={0.8}>
    <View style={styles.cardHeader}>
      <View style={styles.cardRadio}>
        {isSelected && <View style={styles.cardRadioDot} />}
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.cardName}>{address.name}</Text>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => onEdit(address)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Ionicons name="create-outline" size={18} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(address)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}} style={{marginLeft: 12}}>
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
    <Text style={styles.cardAddress} numberOfLines={3}>
      {[address.addressLine, address.locality, address.landmark].filter(Boolean).join(', ')}
    </Text>
    <Text style={styles.cardCity}>
      {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
    </Text>
    {address.phone && (
      <View style={styles.cardPhone}>
        <Ionicons name="call-outline" size={12} color={colors.textLight} />
        <Text style={styles.cardPhoneText}>{address.phone}</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ── AddressScreen ────────────────────────────────────────────────────────────
const AddressScreen = ({navigation, route}) => {
  const {user} = useAuth();
  const customerId = user?.customerId || user?.id;
  const onSelect = route?.params?.onSelect; // callback when used from Checkout

  const {data: addressRes, isLoading} = useAddressesByCustomer(customerId);
  const addresses = addressRes?.data ?? addressRes ?? [];

  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();

  const [mode, setMode] = useState('list'); // list | add | edit
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // GPS state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const geoQuery = useAddressByLocation(coords);

  // Pre-fill name/phone from user profile
  useEffect(() => {
    if (user && mode === 'add') {
      setForm(f => ({
        ...f,
        name: f.name || user.username || user.name || '',
        phone: f.phone || user.contactNumber || user.mobileNumber || '',
      }));
    }
  }, [user, mode]);

  // When geocode API returns data, fill form
  useEffect(() => {
    if (geoQuery.data && coords) {
      const geo = geoQuery.data;
      setForm(f => ({
        ...f,
        addressLine: geo.addressLine || f.addressLine,
        city: geo.city || f.city,
        state: geo.state || f.state,
        pincode: geo.pincode || f.pincode,
        locality: geo.locality || f.locality,
        landmark: geo.landmark || f.landmark,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      setCoords(null); // prevent re-fill
      setGpsLoading(false);
      Toast.show({type: 'success', text1: 'Location detected', text2: 'Address fields updated'});
    }
  }, [geoQuery.data, coords]);

  // ── GPS handler ──────────────────────────────────────────────────────────
  const handleUseMyLocation = useCallback(async () => {
    setGpsLoading(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access in settings to use this feature.');
        setGpsLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });
      const newCoords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCoords(newCoords);
      // Trigger geocode refetch
      setTimeout(() => geoQuery.refetch(), 100);
    } catch (err) {
      setGpsLoading(false);
      Alert.alert('Location Error', err.message || 'Could not get your location');
    }
  }, [geoQuery]);

  // ── Form helpers ─────────────────────────────────────────────────────────
  const updateField = (key, value) => {
    setForm(f => ({...f, [key]: value}));
    if (errors[key]) setErrors(e => ({...e, [key]: undefined}));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone || !/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number';
    if (!form.addressLine.trim()) e.addressLine = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode || !/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (mode === 'edit' && editingAddress) {
        await updateMutation.mutateAsync({id: editingAddress.id, addressData: form});
        Toast.show({type: 'success', text1: 'Address updated'});
      } else {
        await createMutation.mutateAsync({...form, customerId});
        Toast.show({type: 'success', text1: 'Address saved'});
      }
      setMode('list');
      setForm(INITIAL_FORM);
      setEditingAddress(null);
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed', text2: err.message || 'Could not save address'});
    }
  };

  const handleEdit = addr => {
    setEditingAddress(addr);
    setForm({
      name: addr.name || '',
      phone: addr.phone || '',
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      locality: addr.locality || '',
      landmark: addr.landmark || '',
      alternatePhone: addr.alternatePhone || '',
      companyName: addr.companyName || '',
      gstNumber: addr.gstNumber || '',
      isDefault: addr.isDefault || false,
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
    });
    setMode('edit');
  };

  const handleDelete = addr => {
    Alert.alert('Delete Address', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(addr.id);
            Toast.show({type: 'success', text1: 'Address deleted'});
          } catch {
            Toast.show({type: 'error', text1: 'Failed to delete'});
          }
        },
      },
    ]);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setForm({
      ...INITIAL_FORM,
      name: user?.username || user?.name || '',
      phone: user?.contactNumber || user?.mobileNumber || '',
    });
    setErrors({});
    setMode('add');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (mode !== 'list') {
            setMode('list');
          } else {
            navigation.goBack();
          }
        }} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'list' ? 'My Addresses' : mode === 'add' ? 'Add Address' : 'Edit Address'}
        </Text>
        <View style={{width: 22}} />
      </View>

      {mode === 'list' ? (
        /* ── List Mode ── */
        <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="location-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No saved addresses</Text>
              <Text style={styles.emptySub}>Add your first delivery address</Text>
            </View>
          ) : (
            addresses.map((addr, idx) => (
              <AddressCard
                key={addr.id || idx}
                address={addr}
                isSelected={selectedId === addr.id}
                onSelect={a => {
                  setSelectedId(a.id);
                  if (onSelect) onSelect(a);
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}

          <TouchableOpacity style={styles.addBtn} onPress={handleAddNew} activeOpacity={0.75}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* ── Add / Edit Form ── */
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

            {/* Use My Location Button */}
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={handleUseMyLocation}
              disabled={gpsLoading}
              activeOpacity={0.75}>
              {gpsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="navigate" size={18} color={colors.primary} />
              )}
              <Text style={styles.gpsBtnText}>
                {gpsLoading ? 'Detecting location...' : 'Use My Location'}
              </Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <FormField label="Full Name *" value={form.name} error={errors.name}
              onChangeText={v => updateField('name', v)} placeholder="Full name" />
            <FormField label="Phone *" value={form.phone} error={errors.phone}
              onChangeText={v => updateField('phone', v)} placeholder="10-digit number" keyboardType="phone-pad" maxLength={10} />
            <FormField label="Pincode *" value={form.pincode} error={errors.pincode}
              onChangeText={v => updateField('pincode', v)} placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} />
            <FormField label="Address Line *" value={form.addressLine} error={errors.addressLine}
              onChangeText={v => updateField('addressLine', v)} placeholder="House No, Building, Street" multiline />
            <FormField label="Locality" value={form.locality}
              onChangeText={v => updateField('locality', v)} placeholder="Locality / Area" />
            <FormField label="City *" value={form.city} error={errors.city}
              onChangeText={v => updateField('city', v)} placeholder="City" />
            <FormField label="State *" value={form.state} error={errors.state}
              onChangeText={v => updateField('state', v)} placeholder="State" />
            <FormField label="Landmark" value={form.landmark}
              onChangeText={v => updateField('landmark', v)} placeholder="Nearby landmark" />
            <FormField label="Alternate Phone" value={form.alternatePhone}
              onChangeText={v => updateField('alternatePhone', v)} placeholder="Alternate number" keyboardType="phone-pad" maxLength={10} />
            <FormField label="Company Name" value={form.companyName}
              onChangeText={v => updateField('companyName', v)} placeholder="Optional" />
            <FormField label="GST Number" value={form.gstNumber}
              onChangeText={v => updateField('gstNumber', v)} placeholder="Optional" />

            {/* Default checkbox */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => updateField('isDefault', !form.isDefault)}
              activeOpacity={0.7}>
              <Ionicons
                name={form.isDefault ? 'checkbox' : 'square-outline'}
                size={22}
                color={form.isDefault ? colors.primary : colors.textLight}
              />
              <Text style={styles.checkLabel}>Set as default address</Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, isSaving && {opacity: 0.65}]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.75}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'edit' ? 'Update Address' : 'Save Address'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={{height: 40}} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

// ── Reusable form field ─────────────────────────────────────────────────────
const FormField = ({label, value, onChangeText, error, placeholder, multiline, ...rest}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && {height: 70, textAlignVertical: 'top'}, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      multiline={multiline}
      {...rest}
    />
    {error && <Text style={styles.errText}>{error}</Text>}
  </View>
);

export default AddressScreen;

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

  // List
  listScroll: {flex: 1},
  listContent: {padding: 16, paddingBottom: 32},
  centered: {alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 8},
  emptyText: {fontSize: 16, fontWeight: '700', color: colors.text},
  emptySub: {fontSize: 13, color: colors.textSecondary},

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardSelected: {borderColor: colors.primary, backgroundColor: colors.cardPrimary},
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10},
  cardRadio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  cardRadioDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary},
  cardName: {fontSize: 14, fontWeight: '700', color: colors.text},
  defaultBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  defaultBadgeText: {fontSize: 8, fontWeight: '800', color: colors.primary, letterSpacing: 0.5},
  cardAddress: {fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 2},
  cardCity: {fontSize: 12, color: colors.textLight, marginBottom: 6},
  cardPhone: {flexDirection: 'row', alignItems: 'center', gap: 4},
  cardPhoneText: {fontSize: 12, color: colors.textLight},

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {fontSize: 14, fontWeight: '600', color: colors.primary},

  // Form
  formScroll: {flex: 1},
  formContent: {padding: 16},

  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.cardPrimary,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    paddingVertical: 14,
    marginBottom: 20,
  },
  gpsBtnText: {fontSize: 14, fontWeight: '600', color: colors.primary},

  fieldWrap: {marginBottom: 14},
  fieldLabel: {fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6},
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: colors.text,
  },
  inputError: {borderColor: colors.error},
  errText: {fontSize: 11, color: colors.error, marginTop: 3},

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
  },
  checkLabel: {fontSize: 14, fontWeight: '500', color: colors.text},

  submitBtn: {
    backgroundColor: colors.primaryMild,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...shadows.orange,
  },
  submitBtnText: {fontSize: 15, fontWeight: '700', color: colors.white},
});
