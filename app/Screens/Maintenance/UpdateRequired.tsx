import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Linking } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

type Props = StackScreenProps<RootStackParamList, 'UpdateRequired'>;

const UpdateRequired = ({ route }: Props) => {
  const { colors: C } = useTheme();
  const { version, storeUrl } = route.params ?? {};

  const handleUpdate = () => {
    if (storeUrl) Linking.openURL(storeUrl);
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.background} />
      <View style={[styles.iconWrap, { backgroundColor: C.primaryLight }]}>
        <Feather name="download" size={40} color={C.primary} />
      </View>
      <Text style={[styles.title, { color: C.title }]}>Update Required</Text>
      <Text style={[styles.message, { color: C.textLight }]}>
        {version
          ? `A new version (${version}) of the app is available. Please update to continue.`
          : 'A new version of the app is available. Please update to continue.'}
      </Text>
      <Text style={[styles.hint, { color: C.textLight }]}>
        After updating, close and reopen the app.
      </Text>

      <TouchableOpacity
        style={[styles.updateBtn, { backgroundColor: C.primary }]}
        onPress={handleUpdate}
        activeOpacity={0.85}
      >
        <Text style={[styles.updateTxt, { color: C.white }]}>Update Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.padding * 1.5 },
  iconWrap:  { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:     { ...FONTS.h4, ...FONTS.fontSemiBold, marginBottom: 10, textAlign: 'center' },
  message:   { ...FONTS.font, textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  hint:      { ...FONTS.fontXs, textAlign: 'center', marginBottom: 32, fontStyle: 'italic' },
  updateBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14, minWidth: 180, alignItems: 'center' },
  updateTxt: { ...FONTS.font, ...FONTS.fontSemiBold, fontSize: 16 },
});

export default UpdateRequired;
