// app/api/hooks/useNotifications.ts
// Mirrors website NotificationService hook pattern.
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../services/notificationService';
import { useAuthToken } from './useAuthToken';

export const useNotifications = () => {
  const token = useAuthToken();
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });

  const raw = (query.data as any)?.data ?? query.data ?? [];
  const notifications: any[] = Array.isArray(raw) ? raw : [];

  return { ...query, notifications };
};
