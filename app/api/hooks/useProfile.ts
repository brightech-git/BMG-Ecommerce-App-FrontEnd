// app/api/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateUserById } from '../services/profileService';
import { useAuthToken } from './useAuthToken';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

export const useProfile = () => {
  const token = useAuthToken();
  const q = useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: !!token });
  const profile = (q.data as any)?.data ?? q.data ?? null;
  return { ...q, profile };
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updatedData }: { id: string | number; updatedData: any }) =>
      updateUserById(id, updatedData),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toastSuccess('Profile updated'); },
    onError: (e) => toastError('Could not update profile', errMsg(e)),
  });
};
