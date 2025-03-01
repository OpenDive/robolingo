import { createContext, useContext } from 'react';
import { ethers } from 'ethers';

export interface WalletContextType {
  status: 'connected' | 'disconnected';
  formattedAddress: string;
  openModal: () => void;
  closeModal: () => void;
  connect: () => void;
  disconnect: () => void;
  isModalOpen: boolean;
  signer: ethers.Signer | null;
}

export const WalletContext = createContext<WalletContextType | null>(null);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWalletContext must be used within a WalletProvider');
  return context;
}; 