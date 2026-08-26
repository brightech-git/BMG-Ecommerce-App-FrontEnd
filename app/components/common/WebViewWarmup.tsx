// Mounts an invisible 1x1 WebView so Android's Chromium engine finishes its
// cold-start initialization before the user reaches a screen that needs a
// real WebView (e.g. the payment gateway) — avoids a multi-second first-load delay.
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewWarmup = () => {
  if (Platform.OS !== 'android') return null;
  return (
    <WebView
      source={{ uri: 'about:blank' }}
      style={styles.hidden}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, top: -1000 },
});

export default WebViewWarmup;
