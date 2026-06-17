import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Switch between dev and prod by changing this one line
const BASE_URL = __DEV__
  ? 'https://app.bmgjewellers.com/api/v1/'   // Android emulator → localhost:8081
  : 'https://app.bmgjewellers.com/api/v1/'; // Production

// ⚠️ For iOS simulator dev, use 'http://localhost:8081/api/v1/'
// ⚠️ For physical device dev, use your machine's local IP, e.g. 'http://192.168.x.x:8081/api/v1/'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
});

// Attach token from AsyncStorage before every request
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Global response error handler
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

export default api;
