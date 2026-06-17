import axios from 'axios';
import { API_BASE_URL } from '@env';
import { AsyncStorageHelper } from '../utils/AsyncStorageHelper';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// In-memory token — a fast path set on login/boot. The request interceptor
// falls back to AsyncStorage so the token is ALWAYS attached when one exists,
// even if setAuthToken() wasn't called (e.g. after a cold start).
let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
  _token = token;
};

export const getInMemoryToken = () => _token;

// Request interceptor — attach the Bearer token on every request.
// Uses in-memory token first, then falls back to AsyncStorage (and caches it).
axiosInstance.interceptors.request.use(async (config) => {
  let token = _token;
  if (!token) {
    token = await AsyncStorageHelper.getToken();
    if (token) _token = token; // cache for subsequent calls
  }
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — on a genuine 401 clear only the in-memory token so the
// next request re-reads storage. We do NOT auto-wipe the stored session here
// (that caused a logout cascade on transient 401s); logout() clears storage.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      _token = null;
    }
    return Promise.reject(error);
  }
);
