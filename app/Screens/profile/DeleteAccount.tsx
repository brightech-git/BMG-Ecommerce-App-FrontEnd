// app/Screens/profile/DeleteAccount.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useDeleteAccount } from '../../api/hooks/useDeleteAccount';
import { logout } from '../../redux/reducer/authReducer';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

type Props = StackScreenProps<RootStackParamList, 'DeleteAccount'>;

const CONSEQUENCES = [
  'Your profile, saved addresses and order history will be permanently removed',
  'You will lose access to your wishlist and saved cart',
  'Any pending orders will not be affected, but you won\'t be able to track them from this account',
  'This action cannot be undone',
];

const DeleteAccount = ({ navigation }: Props) => {
  const { colors: C } = useTheme();
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: any) => state.auth);
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const [confirmText, setConfirmText] = useState('');

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE' && !isDeleting;

  const handleDelete = () => {
    if (!user?.id) {
      toastError('Could not identify your account. Please log in again.');
      return;
    }
    Alert.alert(
      'Delete account permanently?',
      'This will erase your account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(user.id);
              toastSuccess('Your account has been deleted');
              dispatch(logout());
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] }));
            } catch (e: any) {
              toastError('Could not delete account', errMsg(e));
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.card} />

      <View style={[styles.header, { backgroundColor: C.card, borderBottomColor: C.borderColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={C.title} />
        </TouchableOpacity>
        <Text style={[styles.hTitle, { color: C.title }]}>Delete Account</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

          <View style={[styles.warnBanner, { backgroundColor: 'rgba(255,49,49,0.08)' }]}>
            <Feather name="alert-triangle" size={20} color={C.danger} />
            <Text style={[styles.warnTxt, { color: C.danger }]}>
              Deleting your account is permanent and cannot be reversed.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: C.card }]}>
            <Text style={[styles.cardTitle, { color: C.title }]}>What happens when you delete your account</Text>
            {CONSEQUENCES.map((c, i) => (
              <View key={i} style={styles.consequenceRow}>
                <Feather name="x-circle" size={15} color={C.danger} style={{ marginTop: 2 }} />
                <Text style={[styles.consequenceTxt, { color: C.text }]}>{c}</Text>
              </View>
            ))}
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: C.textLight }]}>
              Type DELETE to confirm
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.input, borderColor: C.borderColor, color: C.title }]}
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={C.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: C.danger }, !canDelete && { opacity: 0.5 }]}
            onPress={handleDelete}
            disabled={!canDelete}
            activeOpacity={0.85}
          >
            <Text style={styles.deleteTxt}>
              {isDeleting ? 'Deleting…' : 'Delete My Account'}
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

  warnBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12 },
  warnTxt:    { flex: 1, ...FONTS.fontSm, lineHeight: 18, fontWeight: '600' },

  card:       { borderRadius: 16, padding: 16, gap: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  cardTitle:  { ...FONTS.fontSm, ...FONTS.fontSemiBold, marginBottom: 4 },
  consequenceRow: { flexDirection: 'row', gap: 8 },
  consequenceTxt: { flex: 1, ...FONTS.fontSm, lineHeight: 19 },

  fieldWrap:  { gap: 8 },
  label:      { ...FONTS.fontXs, fontWeight: '600', letterSpacing: 0.3 },
  input:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, ...FONTS.font },

  deleteBtn:  { borderRadius: 14, paddingVertical: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  deleteTxt:  { color: '#fff', ...FONTS.font, ...FONTS.fontSemiBold, fontSize: 16 },
});

export default DeleteAccount;
