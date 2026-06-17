// app/api/services/profileService.ts
// Mirrors website src/service/profileService.jsx.
import { callApi } from '../apiClient';
import { PROFILE } from '../endpoints';

export const getProfile = () =>
  callApi<null, any>({ method: 'get', url: PROFILE.ME });

export const getUserById = (id: string | number) =>
  callApi<null, any>({ method: 'get', url: PROFILE.BY_ID.replace(':id', String(id)) });

export const updateUserById = (id: string | number, updatedData: any) =>
  callApi<any, any>({ method: 'put', url: PROFILE.UPDATE.replace(':id', String(id)), data: updatedData });
