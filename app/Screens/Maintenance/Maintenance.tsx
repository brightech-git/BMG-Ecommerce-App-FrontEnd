import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Feather } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../Navigations/RootStackParamList';
import { resolveInitialRoute } from '../../Navigations/resolveInitialRoute';
import { getAppMaintenanceConfig } from '../../api/services/appConfigService';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

type Props = StackScreenProps<RootStackParamList, 'Maintenance'>;

const DEFAULT_MSG = "We're currently performing scheduled maintenance. Please check back shortly.";

const Maintenance = ({ route, navigation }: Props) => {
  const { colors: C } = useTheme();
  const dispatch = useDispatch<any>();
  const [message, setMessage] = useState(route.params?.message || DEFAULT_MSG);
  const [checking, setChecking] = useState(false);

  const handleRetry = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const cfg = await getAppMaintenanceConfig();
      if (cfg?.isMaintenance) {
        setMessage(cfg.maintenanceMsg || DEFAULT_MSG);
        return;
      }
      const resolvedRoute = await resolveInitialRoute(dispatch);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: resolvedRoute }] }));
    } catch {
      // Network still down — stay on this screen, let the user retry again.
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.background} />
      <View style={[styles.iconWrap, { backgroundColor: C.primaryLight }]}>
        <Feather name="tool" size={40} color={C.primary} />
      </View>
      <Text style={[styles.title, { color: C.title }]}>Under Maintenance</Text>
      <Text style={[styles.message, { color: C.textLight }]}>{message}</Text>

      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: C.primary }, checking && { opacity: 0.7 }]}
        onPress={handleRetry}
        disabled={checking}
        activeOpacity={0.85}
      >
        {checking
          ? <ActivityIndicator size="small" color={C.white} />
          : <Text style={[styles.retryTxt, { color: C.white }]}>Retry</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.padding * 1.5 },
  iconWrap:  { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title:     { ...FONTS.h4, ...FONTS.fontSemiBold, marginBottom: 10, textAlign: 'center' },
  message:   { ...FONTS.font, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  retryBtn:  { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 14, minWidth: 140, alignItems: 'center' },
  retryTxt:  { ...FONTS.font, ...FONTS.fontSemiBold, fontSize: 16 },
});

export default Maintenance;
