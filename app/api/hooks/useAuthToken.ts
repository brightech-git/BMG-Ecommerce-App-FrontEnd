// app/api/hooks/useAuthToken.ts
// Resolves the auth token from Redux first, falling back to AsyncStorage so that
// cart/wishlist work across app reloads (Redux auth state is not persisted).
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AsyncStorageHelper } from '../../utils/AsyncStorageHelper';

export const useAuthToken = (): string | null => {
  const reduxToken = useSelector((s: any) => s.auth?.token);
  const [token, setToken] = useState<string | null>(reduxToken ?? null);

  useEffect(() => {
    let active = true;
    if (reduxToken) {
      setToken(reduxToken);
      return;
    }
    AsyncStorageHelper.getToken().then((t) => { if (active) setToken(t ?? null); });
    return () => { active = false; };
  }, [reduxToken]);

  return token;
};
