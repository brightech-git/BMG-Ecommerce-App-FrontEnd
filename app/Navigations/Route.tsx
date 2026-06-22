import React, { useState } from "react";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import StackNavigator from "./StackNavigator";
import themeContext from "../constants/themeContext";
import { COLORS } from "../constants/theme";
import PersistentBottomTab from "../layout/PersistentBottomTab";
import { navigationRef } from "./navigationRef";
import { useTheme } from "../context/ThemeContext";

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
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { colors: C, isDark } = useTheme();

  const authContext = React.useMemo(() => ({
    setDarkTheme: () => setIsDarkTheme(true),
    setLightTheme: () => setIsDarkTheme(false),
  }), []);

  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: COLORS.background,
      title: COLORS.title,
      card: COLORS.card,
      text: COLORS.text,
      textLight: COLORS.textLight,
      input: COLORS.input,
      border: COLORS.borderColor,
    },
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      background: COLORS.darkBackground,
      title: COLORS.darkTitle,
      card: COLORS.darkCard,
      text: COLORS.darkText,
      textLight: COLORS.darkTextLight,
      input: COLORS.darkInput,
      border: COLORS.darkBorder,
    },
  };

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  // Track navigation state for PersistentBottomTab (no navigator hooks needed)
  const [rootRoute, setRootRoute]   = useState('');
  const [activeRoute, setActiveRoute] = useState('');

  const handleStateChange = (state: any) => {
    setRootRoute(getRootRoute(state));
    setActiveRoute(getActiveRoute(state));
  };

  return (
    <SafeAreaProvider>
      <themeContext.Provider value={authContext}>
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
        </NavigationContainer>
      </themeContext.Provider>
    </SafeAreaProvider>
  );
};

export default Routes;
