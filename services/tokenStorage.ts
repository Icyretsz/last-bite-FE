import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const IS_FIRST_LOGIN_KEY = 'is_first_login';

const waitForStorage = async () => {
  // Wait for AsyncStorage to be ready (useful for Expo Go / emulators)
  await new Promise(resolve => setTimeout(resolve, 50));
};

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken?: string) {
    await waitForStorage();
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  async getAccessToken(): Promise<string | null> {
    await waitForStorage();
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    await waitForStorage();
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async clearTokens() {
    await waitForStorage();
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Ignore errors when clearing tokens
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    await waitForStorage();
    await AsyncStorage.setItem(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    await waitForStorage();
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    await waitForStorage();
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore errors when removing items
    }
  },

  async isFirstLogin(): Promise<boolean> {
    await waitForStorage();
    try {
      const value = await AsyncStorage.getItem(IS_FIRST_LOGIN_KEY);
      return value === null; // First login if key doesn't exist
    } catch {
      return true;
    }
  },

  async setFirstLoginComplete(): Promise<void> {
    await waitForStorage();
    await AsyncStorage.setItem(IS_FIRST_LOGIN_KEY, 'false');
  },
};
