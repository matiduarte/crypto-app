import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@constants/config';

class StorageService {
  // Generic storage methods
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw error;
    }
  }

  // User-specific methods
  async setUserToken(token: string): Promise<void> {
    await this.setItem(APP_CONFIG.STORAGE_KEYS.USER_TOKEN, token);
  }

  async getUserToken(): Promise<string | null> {
    return await this.getItem<string>(APP_CONFIG.STORAGE_KEYS.USER_TOKEN);
  }

  async removeUserToken(): Promise<void> {
    await this.removeItem(APP_CONFIG.STORAGE_KEYS.USER_TOKEN);
  }

  async setUserData<T>(userData: T): Promise<void> {
    await this.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, userData);
  }

  async getUserData<T>(): Promise<T | null> {
    return await this.getItem<T>(APP_CONFIG.STORAGE_KEYS.USER_DATA);
  }

  async removeUserData(): Promise<void> {
    await this.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
  }

  // Scanned wallets methods
  async setScannedWallets<T>(wallets: T[]): Promise<void> {
    await this.setItem(APP_CONFIG.STORAGE_KEYS.SCANNED_WALLETS, wallets);
  }

  async getScannedWallets<T>(): Promise<T[]> {
    const wallets = await this.getItem<T[]>(
      APP_CONFIG.STORAGE_KEYS.SCANNED_WALLETS,
    );
    return wallets || [];
  }

  async addScannedWallet<T>(wallet: T): Promise<void> {
    const existingWallets = await this.getScannedWallets<T>();
    const updatedWallets = [...existingWallets, wallet];
    await this.setScannedWallets(updatedWallets);
  }

  async removeScannedWallet<T>(walletId: string): Promise<void> {
    const existingWallets = await this.getScannedWallets<T & { id: string }>();
    const updatedWallets = existingWallets.filter(
      wallet => wallet.id !== walletId,
    );
    await this.setScannedWallets(updatedWallets);
  }

  // Favorite cryptos methods
  async setFavoriteCryptos(cryptoIds: string[]): Promise<void> {
    await this.setItem(APP_CONFIG.STORAGE_KEYS.FAVORITE_CRYPTOS, cryptoIds);
  }

  async getFavoriteCryptos(): Promise<string[]> {
    const favorites = await this.getItem<string[]>(
      APP_CONFIG.STORAGE_KEYS.FAVORITE_CRYPTOS,
    );
    return favorites || [];
  }

  async addFavoriteCrypto(cryptoId: string): Promise<void> {
    const existingFavorites = await this.getFavoriteCryptos();
    if (!existingFavorites.includes(cryptoId)) {
      const updatedFavorites = [...existingFavorites, cryptoId];
      await this.setFavoriteCryptos(updatedFavorites);
    }
  }

  async removeFavoriteCrypto(cryptoId: string): Promise<void> {
    const existingFavorites = await this.getFavoriteCryptos();
    const updatedFavorites = existingFavorites.filter(id => id !== cryptoId);
    await this.setFavoriteCryptos(updatedFavorites);
  }

  // App settings methods
  async setAppSettings<T>(settings: T): Promise<void> {
    await this.setItem(APP_CONFIG.STORAGE_KEYS.APP_SETTINGS, settings);
  }

  async getAppSettings<T>(): Promise<T | null> {
    return await this.getItem<T>(APP_CONFIG.STORAGE_KEYS.APP_SETTINGS);
  }

  // Check if user is logged in
  async isUserLoggedIn(): Promise<boolean> {
    const token = await this.getUserToken();
    return !!token;
  }

  // Clear all user data (logout)
  async clearUserData(): Promise<void> {
    await this.removeUserToken();
    await this.removeUserData();
  }
}

export default new StorageService();
