// app/api/services/notificationService.ts
import { callApi } from '../apiClient';
import { MISC, NOTIF } from '../endpoints';

export const registerDevice = (payload: {
  deviceToken: string;
  deviceType: 'android' | 'ios';
  userId?: string | number;
}) => callApi<typeof payload, any>({ method: 'post', url: MISC.DEVICE_REGISTER, data: payload });

/** GET /notifications/user/{userId} */
export const getNotificationsByUser = (userId: number) =>
  callApi<null, any>({ method: 'get', url: NOTIF.GET_USER(userId) });

/** GET /notifications/user/{userId}/unread-count */
export const getUnreadCount = (userId: number) =>
  callApi<null, any>({ method: 'get', url: NOTIF.UNREAD_COUNT(userId) });

/** PUT /notifications/read/{notifId}/user/{userId} */
export const markNotificationRead = (notifId: number, userId: number) =>
  callApi<null, any>({ method: 'put', url: NOTIF.MARK_READ(notifId, userId) });

/** PUT /notifications/read/all/{userId} */
export const markAllNotificationsRead = (userId: number) =>
  callApi<null, any>({ method: 'put', url: NOTIF.MARK_ALL_READ(userId) });

/** DELETE /notifications/notification/{id} */
export const deleteNotification = (id: number) =>
  callApi<null, any>({ method: 'delete', url: NOTIF.DELETE_ONE(id) });

/** DELETE /notifications/user/{userId} */
export const deleteAllNotifications = (userId: number) =>
  callApi<null, any>({ method: 'delete', url: NOTIF.DELETE_BY_USER(userId) });
