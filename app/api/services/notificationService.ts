// app/api/services/notificationService.ts
// Mirrors website NotificationService — device registration + notification list.
import { callApi } from '../apiClient';
import { MISC } from '../endpoints';

export const registerDevice = (payload: {
  deviceToken: string;
  deviceType: 'android' | 'ios';
  userId?: string | number;
}) => callApi<typeof payload, any>({ method: 'post', url: MISC.DEVICE_REGISTER, data: payload });

export const getNotifications = () =>
  callApi<null, any>({ method: 'get', url: MISC.NOTIFICATION_LIST });
