import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  getAddressesByCustomer,
  createAddress,
  updateAddress,
  deleteAddress,
  geocodeAddress,
} from '../services/AddressService';

// Fetch all addresses for a customer
export const useAddressesByCustomer = customerId =>
  useQuery({
    queryKey: ['addresses', customerId],
    queryFn: () => getAddressesByCustomer(customerId),
    enabled: !!customerId,
  });

// Geocode — manual refetch only
export const useAddressByLocation = coords =>
  useQuery({
    queryKey: ['address-geocode', coords?.latitude, coords?.longitude],
    queryFn: () => geocodeAddress(coords?.latitude, coords?.longitude),
    enabled: false, // triggered manually via refetch()
  });

// Create address
export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => qc.invalidateQueries({queryKey: ['addresses']}),
  });
};

// Update address
export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({id, addressData}) => updateAddress(id, addressData),
    onSuccess: () => qc.invalidateQueries({queryKey: ['addresses']}),
  });
};

// Delete address
export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => qc.invalidateQueries({queryKey: ['addresses']}),
  });
};
