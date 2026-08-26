import { callApi } from '../apiClient';
import { APP_CONFIG } from '../endpoints';
import { AppMaintenanceConfig } from '../../types/appConfig';

/** Returns the active app-maintenance/version config, or null if unavailable. */
export const getAppMaintenanceConfig = async (): Promise<AppMaintenanceConfig | null> => {
  const res = await callApi<null, AppMaintenanceConfig[] | AppMaintenanceConfig>({
    method: 'get',
    url: APP_CONFIG.MAINTENANCE,
  });
  const list = Array.isArray(res) ? res : (res as any)?.data ?? [res];
  return list?.[0] ?? null;
};
