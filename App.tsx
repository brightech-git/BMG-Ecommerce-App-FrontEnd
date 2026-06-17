import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import {AuthProvider} from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {retry: 1, staleTime: 1000 * 60 * 5},
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
