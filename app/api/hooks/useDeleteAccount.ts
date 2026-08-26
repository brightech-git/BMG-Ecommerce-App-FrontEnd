import { useMutation } from '@tanstack/react-query';
import { deleteUserAccount } from '../services/authService';
import { errMsg } from '../../utils/toast';

export const useDeleteAccount = () => {
  const mutation = useMutation({
    mutationFn: (id: string | number) => deleteUserAccount(id),
  });

  return {
    deleteAccount: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error ? errMsg(mutation.error) : null,
  };
};
