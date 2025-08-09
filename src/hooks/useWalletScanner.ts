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





