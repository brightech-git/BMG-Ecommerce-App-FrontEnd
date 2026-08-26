export interface AppMaintenanceConfig {
  id: number;
  androidVersion: string;
  androidStoreUrl: string;
  iosVersion: string;
  iosStoreUrl: string;
  isMaintenance: boolean;
  maintenanceMsg: string;
  updatedAt?: string;
}
