// app/api/services/addressService.ts
// Mirrors website src/service/AddressService.jsx + newAddressService.js.
import { callApi } from '../apiClient';
import { ADDRESS } from '../endpoints';

export interface AddressData {
  id?: number | string;
  customerId?: number | string;
  name?: string;
  phone?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  landmark?: string;
  addressType?: string;
  isDefault?: boolean;
  [key: string]: any;
}

export const createAddress = (data: AddressData) =>
  callApi<AddressData, any>({ method: 'post', url: ADDRESS.CREATE, data });

export const getAddressesByCustomer = (customerId: string | number) =>
  callApi<null, any>({ method: 'get', url: ADDRESS.BY_CUSTOMER.replace(':customerId', String(customerId)) });

export const getAddressById = (id: string | number) =>
  callApi<null, any>({ method: 'get', url: ADDRESS.BY_ID.replace(':id', String(id)) });

export const updateAddress = (id: string | number, data: AddressData) =>
  callApi<AddressData, any>({ method: 'put', url: ADDRESS.UPDATE.replace(':id', String(id)), data });

export const deleteAddress = (id: string | number) =>
  callApi<null, any>({ method: 'delete', url: ADDRESS.DELETE.replace(':id', String(id)) });
