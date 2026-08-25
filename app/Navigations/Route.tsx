import React, { useState } from "react";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import StackNavigator from "./StackNavigator";
import PersistentBottomTab from "../layout/PersistentBottomTab";
import { navigationRef } from "./navigationRef";
import { useTheme } from "../context/ThemeContext";
import GlobalAlertHost from "../components/commoncomponents/GlobalAlert";

/* ─── Helpers to extract route names from navigation state ─────── */
function getRootRoute(state: any): string {
  if (!state) return '';
  return state.routes?.[state.index ?? 0]?.name ?? '';
}

function getActiveRoute(state: any): string {
  if (!state) return '';
  let s = state;
  while (s.routes?.[s.index ?? 0]?.state) {
    s = s.routes[s.index ?? 0].state;
  }
  return s.routes?.[s.index ?? 0]?.name ?? '';
}

/* ─── Routes component ──────────────────────────────────────────── */
const Routes = () => {
  const { colors: C, isDark } = useTheme();

  // Keep NavigationContainer theme in sync with the app's ThemeContext
  // so BottomTab (which reads useTheme from @react-navigation/native) gets correct colors
  const theme = {
    ...(isDark ? NavigationDarkTheme : NavigationDefaultTheme),
    dark: isDark,
    colors: {
      ...(isDark ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      background: C.background,
      card:       C.card,
      text:       C.text,
      border:     C.borderColor,
      // custom extras consumed by BottomTab
      title:      C.title,
      textLight:  C.textLight,
      input:      C.input,
    },
  };

  // Track navigation state for PersistentBottomTab (no navigator hooks needed)
  const [rootRoute, setRootRoute]   = useState('');
  const [activeRoute, setActiveRoute] = useState('');

  const handleStateChange = (state: any) => {
    setRootRoute(getRootRoute(state));
    setActiveRoute(getActiveRoute(state));
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer
          ref={navigationRef}
          theme={theme}
          onStateChange={handleStateChange}
        >
          <View style={{ flex: 1 }}>
            <StackNavigator />
            <PersistentBottomTab
              rootRoute={rootRoute}
              activeRoute={activeRoute}
              isDark={isDark}
              cardColor={C.card}
              titleColor={C.title}
              bgColor={C.background}
            />
          </View>
          <GlobalAlertHost />
        </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Routes;
