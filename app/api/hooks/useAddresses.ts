// app/api/hooks/useAddresses.ts
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAddressesByCustomer, createAddress, updateAddress, deleteAddress, AddressData,
} from '../services/addressService';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';
import { useAuthToken } from './useAuthToken';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

/** Resolve the logged-in customer id from storage. */
const useCustomerId = () => {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      let uid = await AsyncStorageHelper.getUserId();
      if (!uid) {
        const u = await AsyncStorageHelper.getUser();
        uid = u?.id != null ? String(u.id) : null;
      }
      setId(uid ?? null);
    })();
  }, []);
  return id;
};

export const useAddresses = () => {
  const qc = useQueryClient();
  const token = useAuthToken();
  const customerId = useCustomerId();

  const listQuery = useQuery({
    queryKey: ['addresses', customerId],
    queryFn: () => getAddressesByCustomer(customerId!),
    enabled: !!token && !!customerId,
  });

  const addresses: AddressData[] = Array.isArray(listQuery.data)
    ? listQuery.data
    : (listQuery.data as any)?.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });

  const createMutation = useMutation({
    mutationFn: (data: AddressData) => createAddress({ ...data, customerId: data.customerId ?? customerId ?? undefined }),
    onSuccess: () => { invalidate(); toastSuccess('Address saved'); },
    onError: (e) => toastError('Could not save address', errMsg(e)),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: AddressData }) => updateAddress(id, data),
    onSuccess: () => { invalidate(); toastSuccess('Address updated'); },
    onError: (e) => toastError('Could not update address', errMsg(e)),
  });
  const removeMutation = useMutation({
    mutationFn: (id: string | number) => deleteAddress(id),
    onSuccess: () => { invalidate(); toastSuccess('Address removed'); },
    onError: (e) => toastError('Could not remove address', errMsg(e)),
  });

  return {
    customerId,
    addresses,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    createAddress: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateAddress: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteAddress: removeMutation.mutate,
  };
};
