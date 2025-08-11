import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

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

  /**
   * Securely store a item using Keychain
   * @param key
   * @param value
   */
  async setSecureItem(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(key, value, { service: key });
  }

  /**
   * Retrieve a value securely
   */
  async getSecureItem(key: string): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: key });
    return credentials ? credentials.password : null;
  }

  /**
   * Remove a value securely
   */
  async removeSecureItem(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
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
}

export default new StorageService();
