import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import FlashMessage from 'react-native-flash-message';
import store from './app/redux/store';
import { queryClient } from './app/api/queryClient';
import Route from './app/Navigations/Route';
import { ToastProvider } from './app/components/commoncomponents/Toast';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';

// Inner component so useTheme() can read the Provider above it
function AppShell() {
  const { isDark } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Route />
          </ToastProvider>
        </QueryClientProvider>
      </Provider>
    </SafeAreaView>
  );
}

export default function App() {
  const [loaded] = useFonts({
    JostBold:        require('./app/assets/fonts/Jost-Bold.ttf'),
    JostSemiBold:    require('./app/assets/fonts/Jost-SemiBold.ttf'),
    JostLight:       require('./app/assets/fonts/Jost-Light.ttf'),
    JostMedium:      require('./app/assets/fonts/Jost-Medium.ttf'),
    JostRegular:     require('./app/assets/fonts/Jost-Regular.ttf'),
    JostExtraLight:  require('./app/assets/fonts/Jost-ExtraLight.ttf'),
    MarcellusRegular: require('./app/assets/fonts/Marcellus-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
      <FlashMessage position="top" floating />
    </SafeAreaProvider>
  );
}
