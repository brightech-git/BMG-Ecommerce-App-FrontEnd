// app/api/hooks/useNotifications.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationsByUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/notificationService';

const KEY = (userId: number) => ['notifications', userId];

/** Fetch all notifications for a user */
export const useNotifications = (userId: number | undefined) => {
  const query = useQuery({
    queryKey: KEY(userId!),
    queryFn: () => getNotificationsByUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  const raw = (query.data as any)?.data ?? query.data ?? [];
  const notifications: any[] = Array.isArray(raw) ? raw : [];

  return { ...query, notifications };
};

/** Unread count */
export const useUnreadCount = (userId: number | undefined) => {
  const query = useQuery({
    queryKey: ['notif-unread', userId],
    queryFn: () => getUnreadCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
  const count: number =
    typeof query.data === 'number'
      ? query.data
      : (query.data as any)?.count ?? (query.data as any)?.unreadCount ?? 0;
  return { ...query, count };
};

/** Mark one notification as read */
export const useMarkRead = (userId: number | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notifId: number) => markNotificationRead(notifId, userId!),
    onSuccess: () => { if (userId) qc.invalidateQueries({ queryKey: KEY(userId) }); },
  });
};

/** Mark all notifications as read */
export const useMarkAllRead = (userId: number | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId!),
    onSuccess: () => { if (userId) qc.invalidateQueries({ queryKey: KEY(userId) }); },
  });
};

/** Delete a single notification */
export const useDeleteNotification = (userId: number | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => { if (userId) qc.invalidateQueries({ queryKey: KEY(userId) }); },
  });
};

/** Delete all notifications for the user */
export const useDeleteAllNotifications = (userId: number | undefined) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAllNotifications(userId!),
    onSuccess: () => { if (userId) qc.invalidateQueries({ queryKey: KEY(userId) }); },
  });
};
