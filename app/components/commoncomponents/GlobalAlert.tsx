// Lets code outside the React tree (e.g. app/api/axiosInstance.ts) trigger the
// styled CustomAlert modal, the same way navigationRef lets it trigger navigation.
import React, { useCallback, useEffect, useState } from 'react';
import CustomAlert, { AlertButton, AlertType } from './CustomAlert';

export type GlobalAlertOptions = {
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  dismissible?: boolean;
};

let showFn: ((opts: GlobalAlertOptions) => void) | null = null;

export function showGlobalAlert(opts: GlobalAlertOptions) {
  showFn?.(opts);
}

export default function GlobalAlertHost() {
  const [options, setOptions] = useState<GlobalAlertOptions | null>(null);

  useEffect(() => {
    showFn = setOptions;
    return () => { showFn = null; };
  }, []);

  const handleDismiss = useCallback(() => setOptions(null), []);

  return (
    <CustomAlert
      visible={!!options}
      type={options?.type ?? 'info'}
      title={options?.title ?? ''}
      message={options?.message}
      buttons={options?.buttons}
      dismissible={options?.dismissible ?? true}
      onDismiss={handleDismiss}
    />
  );
}
