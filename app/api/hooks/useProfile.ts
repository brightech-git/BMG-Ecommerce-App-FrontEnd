// app/api/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateUserById, changePasswordApi } from '../services/profileService';
import { useAuthToken } from './useAuthToken';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

export const useProfile = () => {
  const token = useAuthToken();
  const q = useQuery({ queryKey: ['profile'], queryFn: getProfile, enabled: !!token });
  const profile = (q.data as any)?.data ?? q.data ?? null;
  return { ...q, profile };
};

export const useChangePassword = () => {
  const token = useAuthToken();
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      changePasswordApi(oldPassword, newPassword, token ?? ''),
    onSuccess: () => toastSuccess('Password changed successfully'),
    onError: (e) => toastError('Failed to change password', errMsg(e)),
  });
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
