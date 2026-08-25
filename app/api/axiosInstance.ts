import axios from 'axios';
import { CommonActions } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import { AsyncStorageHelper } from '../utils/AsyncStorageHelper';
import { navigationRef } from '../Navigations/navigationRef';
import { showGlobalAlert } from '../components/commoncomponents/GlobalAlert';
import store from '../redux/store';
import { logout } from '../redux/reducer/authReducer';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});
console.log('[axiosInstance] Base URL:', API_BASE_URL);

let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
  _token = token;
};

export const getInMemoryToken = () => _token;


axiosInstance.interceptors.request.use(async (config) => {
  let token = _token;
  if (!token) {
    // AsyncStorageHelper.removeToken(); // Clear any stale token in storage
    token = await AsyncStorageHelper.getToken();
    if (token) _token = token;
  }
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    // console.log('[axiosInstance] Authorization header:', config.headers['Authorization']);
  } else {
    console.log('[axiosInstance] No token found — Authorization header not set.');
  }
  console.log('[axiosInstance] Request URL:', (config.baseURL ?? '') + (config.url ?? ''));
  return config;
});


let _sessionExpiredHandled = false;

const handleSessionExpired = () => {
  if (_sessionExpiredHandled) return;
  _sessionExpiredHandled = true;

  store.dispatch(logout());

  // Navigate straight away — don't wait for the alert to be dismissed.
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] })
    );
  }

  showGlobalAlert({
    type: 'warning',
    title: 'Login expired',
    message: 'Please login and continue shopping.',
  });


  _sessionExpiredHandled = false;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      console.log('[axiosInstance] 401/403 response — session expired, logging out.');
      handleSessionExpired();
    }
    return Promise.reject(error);
  }
);
