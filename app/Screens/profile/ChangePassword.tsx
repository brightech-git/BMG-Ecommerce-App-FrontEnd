// app/Screens/profile/ChangePassword.tsx
// Field is defined OUTSIDE the screen component so its type is stable across renders.
// If it were inside, every keystroke would recreate the component type → TextInput unmounts → focus lost.
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useChangePassword } from '../../api/hooks/useProfile';
import { ThemeColors } from '../../context/ThemeContext';

type Props = StackScreenProps<RootStackParamList, 'ChangePassword'>;

/* ─── Field lives OUTSIDE ChangePassword so its identity never changes ── */
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  C: ThemeColors;
};

const Field = ({ label, value, onChange, show, onToggle, placeholder, C }: FieldProps) => (
  <View style={styles.fieldWrap}>
    <Text style={[styles.label, { color: C.textLight }]}>{label}</Text>
    <View style={[styles.inputRow, { backgroundColor: C.input, borderColor: C.borderColor }]}>
      <TextInput
        style={[styles.input, { color: C.title }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.placeholder}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity onPress={onToggle} style={styles.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name={show ? 'eye-off' : 'eye'} size={18} color={C.textLight} />
      </TouchableOpacity>
    </View>
  </View>
);

/* ─── screen ─────────────────────────────────────────────────────── */
const ChangePassword = ({ navigation }: Props) => {
  const { colors: C } = useTheme();
  const { mutate, isPending } = useChangePassword();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld,     setShowOld]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = () => {
    setError('');
    if (!oldPassword || !newPassword || !confirmPass) {
      setError('All fields are required.'); return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.'); return;
    }
    if (newPassword !== confirmPass) {
      setError('New passwords do not match.'); return;
    }
    mutate({ oldPassword, newPassword }, {
      onSuccess: () => navigation.goBack(),
    });
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Change Password</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

          {/* Info banner */}
          <View style={[styles.infoBanner, { backgroundColor: C.primaryLight }]}>
            <Feather name="lock" size={18} color={C.primary} />
            <Text style={[styles.infoTxt, { color: C.primary }]}>
              Use a strong password with letters, numbers and symbols.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: C.card }]}>
            <Field
              label="Current Password"
              value={oldPassword}
              onChange={setOldPassword}
              show={showOld}
              onToggle={() => setShowOld(v => !v)}
              placeholder="Enter current password"
              C={C}
            />
            <Field
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(v => !v)}
              placeholder="Enter new password"
              C={C}
            />
            <Field
              label="Confirm New Password"
              value={confirmPass}
              onChange={setConfirmPass}
              show={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
              placeholder="Re-enter new password"
              C={C}
            />
          </View>

          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(255,49,49,0.08)' }]}>
              <Feather name="alert-circle" size={15} color={C.danger} />
              <Text style={[styles.errorTxt, { color: C.danger }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: C.primary }, isPending && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.85}
          >
            <Text style={[styles.submitTxt, { color: C.white }]}>
              {isPending ? 'Updating…' : 'Update Password'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn:    { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hTitle:     { flex: 1, textAlign: 'center', ...FONTS.h6, ...FONTS.fontSemiBold },
  body:       { padding: SIZES.padding, gap: 16, paddingBottom: 40 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12 },
  infoTxt:    { flex: 1, ...FONTS.fontSm, lineHeight: 18 },

  card:       { borderRadius: 16, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  fieldWrap:  { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  label:      { ...FONTS.fontXs, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12 },
  input:      { flex: 1, paddingVertical: 13, ...FONTS.font },
  eyeBtn:     { padding: 8 },

  errorBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10 },
  errorTxt:   { flex: 1, ...FONTS.fontSm },

  submitBtn:  { borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  submitTxt:  { ...FONTS.font, ...FONTS.fontSemiBold, fontSize: 16 },
});

export default ChangePassword;
