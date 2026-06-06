import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { RootStackParamList } from '../../Navigations/RootStackParamList';

type WebViewRoute = RouteProp<RootStackParamList & { WebView: { url: string; title?: string } }, 'WebView'>;

export default function WebViewComponent() {
  const navigation = useNavigation();
  const { params } = useRoute<WebViewRoute>();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={[FONTS.fontSemiBold, styles.headerTitle]} numberOfLines={1}>
          {params?.title ?? 'BMG Jewellers'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        source={{ uri: params?.url }}
        onLoadStart={() => { setLoading(true); setError(false); }}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        style={{ flex: 1 }}
      />

      {loading && !error && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Ionicons name="wifi-outline" size={40} color={COLORS.label} />
          <Text style={[FONTS.fontRegular, { color: COLORS.label, marginTop: 8, fontSize: 14 }]}>
            Failed to load page
          </Text>
          <TouchableOpacity
            onPress={() => { setError(false); setLoading(true); }}
            style={styles.retryBtn}
          >
            <Text style={[FONTS.fontMedium, { color: COLORS.white, fontSize: 14 }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  backBtn:     { width: 40, alignItems: 'flex-start' },
  headerTitle: { flex: 1, fontSize: 16, color: COLORS.white, textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
