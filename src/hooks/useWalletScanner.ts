import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryClient';
import storageService from '../utils/storage';
import { ScannedWallet } from '../types';
import { generateId, detectWalletType } from '../utils/helpers';

// Hook for managing scanned wallets
export const useScannedWallets = () => {
  return useQuery({
    queryKey: queryKeys.user.wallets(),
    queryFn: () => storageService.getScannedWallets<ScannedWallet>(),
    staleTime: Infinity, // Local data doesn't go stale
  });
};

// Hook for adding a new scanned wallet
export const useAddScannedWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      address: string;
      qrData: string;
      label?: string;
    }) => {
      const { address, qrData, label } = params;
      
      const walletType = detectWalletType(address);
      
      const newWallet: ScannedWallet = {
        id: generateId(),
        address,
        type: walletType,
        label: label || `${walletType} wallet`,
        isFavorite: false,
        scannedAt: new Date().toISOString(),
        qrData,
      };

      await storageService.addScannedWallet(newWallet);
      return newWallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};

// Hook for removing a scanned wallet
export const useRemoveScannedWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletId: string) => {
      await storageService.removeScannedWallet(walletId);
      return walletId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};

// Hook for toggling wallet favorite status
export const useToggleWalletFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { walletId: string; isFavorite: boolean }) => {
      const { walletId, isFavorite } = params;
      
      // Get current wallets
      const wallets = await storageService.getScannedWallets<ScannedWallet>();
      
      // Update the specific wallet
      const updatedWallets = wallets.map(wallet =>
        wallet.id === walletId
          ? { ...wallet, isFavorite }
          : wallet
      );
      
      // Save updated wallets
      await storageService.setScannedWallets(updatedWallets);
      
      return { walletId, isFavorite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};

// Hook for updating wallet label
export const useUpdateWalletLabel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { walletId: string; label: string }) => {
      const { walletId, label } = params;
      
      // Get current wallets
      const wallets = await storageService.getScannedWallets<ScannedWallet>();
      
      // Update the specific wallet
      const updatedWallets = wallets.map(wallet =>
        wallet.id === walletId
          ? { ...wallet, label }
          : wallet
      );
      
      // Save updated wallets
      await storageService.setScannedWallets(updatedWallets);
      
      return { walletId, label };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};

// Hook for QR code scanning logic
export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  const addWallet = useAddScannedWallet();

  const startScanning = () => {
    setIsScanning(true);
    setScannedData(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleQRCodeScanned = async (data: string) => {
    setScannedData(data);
    setIsScanning(false);

    // Extract wallet address from QR data
    let address = data;
    
    // Handle different QR formats
    if (data.startsWith('bitcoin:')) {
      address = data.replace('bitcoin:', '').split('?')[0];
    } else if (data.startsWith('ethereum:')) {
      address = data.replace('ethereum:', '').split('?')[0];
    }

    // Validate and add wallet
    const walletType = detectWalletType(address);
    
    if (walletType !== 'unknown') {
      try {
        await addWallet.mutateAsync({
          address,
          qrData: data,
        });
        return { success: true, address, type: walletType };
      } catch (error) {
        console.error('Failed to save scanned wallet:', error);
        return { success: false, error: 'Failed to save wallet' };
      }
    } else {
      return { success: false, error: 'Invalid wallet address format' };
    }
  };

  return {
    isScanning,
    hasPermission,
    scannedData,
    startScanning,
    stopScanning,
    setHasPermission,
    handleQRCodeScanned,
    isAddingWallet: addWallet.isPending,
    addWalletError: addWallet.error,
  };
};

// Hook for getting favorite wallets
export const useFavoriteWallets = () => {
  const { data: allWallets, ...rest } = useScannedWallets();
  
  const favoriteWallets = allWallets?.filter(wallet => wallet.isFavorite) || [];
  
  return {
    data: favoriteWallets,
    ...rest,
  };
};

// Hook for getting wallets by type
export const useWalletsByType = (type: 'bitcoin' | 'ethereum' | 'unknown') => {
  const { data: allWallets, ...rest } = useScannedWallets();
  
  const walletsByType = allWallets?.filter(wallet => wallet.type === type) || [];
  
  return {
    data: walletsByType,
    ...rest,
  };
};

// Hook for clearing all scanned wallets
export const useClearAllWallets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await storageService.setScannedWallets([]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};