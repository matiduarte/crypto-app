import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@services/queryClient';
import storageService from '@utils/storage';
import { ScannedWallet } from '@types';
import { generateId, detectWalletType } from '@utils/helpers';

export const useScannedWallets = () => {
  return useQuery({
    queryKey: queryKeys.user.wallets(),
    queryFn: () => storageService.getScannedWallets<ScannedWallet>(),
    staleTime: Infinity,
  });
};

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

export const useToggleWalletFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { walletId: string; isFavorite: boolean }) => {
      const { walletId, isFavorite } = params;

      const wallets = await storageService.getScannedWallets<ScannedWallet>();

      const updatedWallets = wallets.map(wallet =>
        wallet.id === walletId ? { ...wallet, isFavorite } : wallet,
      );

      await storageService.setScannedWallets(updatedWallets);

      return { walletId, isFavorite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.wallets() });
    },
  });
};
