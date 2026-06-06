mport AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USER: 'user',
  TOKEN: 'token',
} as const;

export const storage = {
  set: async (key: string, value: any) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  get: async <T>(key: string): Promise<T | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  },

  remove: async (key: string) => AsyncStorage.removeItem(key),

  clear: async () => AsyncStorage.clear(),
};
