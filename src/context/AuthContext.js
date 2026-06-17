import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUser,
  registerUser,
  verifyOtpService,
} from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session on app launch

  // Restore user session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Only restore if token exists
          if (parsed?.token) {
            setUser(parsed);
          }
        }
      } catch (_) {
        // ignore storage errors
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const isAuthenticated = !!(user && user.token);

  // Login — payload: { contactOrEmailOrUsername, password }
  const login = async loginData => {
    const response = await loginUser(loginData);
    await AsyncStorage.setItem('user', JSON.stringify(response));
    await AsyncStorage.setItem('user_token', response.token ?? '');
    await AsyncStorage.setItem('userMobileNumber', response.contact ?? '');
    setUser(response);
    return response;
  };

  // Register — payload: { username, email, contactNumber, password }
  // Returns response; caller checks if OTP step is needed
  const signup = async userData => {
    const response = await registerUser({
      ...userData,
      roles: ['ROLE_USER'],
    });

    if (
      typeof response?.message === 'string' &&
      response.message.toLowerCase().includes('already exists')
    ) {
      return {alreadyExists: true, ...response};
    }

    // Registration successful but NOT logged in yet — awaiting OTP
    return response;
  };

  // Verify OTP after registration — payload: { contactNumber, otp }
  const verifyOtp = async ({contactNumber, otp}) => {
    const response = await verifyOtpService({contactNumber, otp});
    // After OTP verified the backend may return user+token
    if (response?.token) {
      await AsyncStorage.setItem('user', JSON.stringify(response));
      await AsyncStorage.setItem('user_token', response.token ?? '');
      await AsyncStorage.setItem('userMobileNumber', response.contact ?? '');
      setUser(response);
    }
    return response;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['user', 'user_token', 'userMobileNumber']);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        verifyOtp,
        logout,
        currentUser: user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
