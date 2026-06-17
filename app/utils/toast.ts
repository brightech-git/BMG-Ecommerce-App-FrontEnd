// app/utils/toast.ts
// App-wide toast helpers (decoupled from React tree so they can be called from
// React Query mutation callbacks). Requires <FlashMessage /> mounted once in App.tsx.
import { showMessage } from 'react-native-flash-message';
import { COLORS } from '../constants/theme';

export const toastSuccess = (message: string, description?: string) =>
  showMessage({ message, description, type: 'success', backgroundColor: COLORS.success, icon: 'success' });

export const toastError = (message: string, description?: string) =>
  showMessage({ message, description, type: 'danger', backgroundColor: COLORS.danger, icon: 'danger' });

export const toastInfo = (message: string, description?: string) =>
  showMessage({ message, description, type: 'info', backgroundColor: COLORS.primary, icon: 'info' });

/** Extract a human message from an ApiError / axios error / Error. */
export const errMsg = (e: any, fallback = 'Something went wrong') =>
  e?.message || e?.response?.data?.message || e?.response?.data?.error || fallback;
