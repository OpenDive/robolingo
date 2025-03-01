import { ethers } from 'ethers';

// Wallet connection type
export type WalletType = 'metamask' | 'sui';

// Wallet connection status
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Wallet info interface
export interface WalletInfo {
  address: string;
  chainId: string | number;
  provider: any;
  type: WalletType;
}

// Error handling
export class WalletError extends Error {
  code?: string | number;
  
  constructor(message: string, code?: string | number) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

// Function to connect to MetaMask
export const connectMetamask = async (): Promise<WalletInfo> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new WalletError('MetaMask not installed', 'METAMASK_NOT_INSTALLED');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new WalletError('No accounts found', 'NO_ACCOUNTS');
    }
    
    // Get the provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    return {
      address: accounts[0],
      chainId: network.chainId,
      provider,
      type: 'metamask'
    };
  } catch (error: any) {
    if (error.code === 4001) {
      // User rejected request
      throw new WalletError('User rejected connection', 'USER_REJECTED');
    }
    
    throw new WalletError(error.message || 'Failed to connect to MetaMask', error.code);
  }
};

// Function to connect to Sui Wallet
export const connectSuiWallet = async (): Promise<WalletInfo> => {
  if (typeof window === 'undefined' || !window.suiWallet) {
    throw new WalletError('Sui Wallet not installed', 'SUI_WALLET_NOT_INSTALLED');
  }
  
  try {
    // Connect to Sui wallet
    const response = await window.suiWallet.requestPermissions();
    const accounts = await window.suiWallet.getAccounts();
    
    if (!accounts || accounts.length === 0) {
      throw new WalletError('No accounts found', 'NO_ACCOUNTS');
    }
    
    return {
      address: accounts[0],
      chainId: 'sui', // Sui doesn't use chainId in the same way
      provider: window.suiWallet,
      type: 'sui'
    };
  } catch (error: any) {
    if (error.code === 4001) {
      // User rejected request
      throw new WalletError('User rejected connection', 'USER_REJECTED');
    }
    
    throw new WalletError(error.message || 'Failed to connect to Sui Wallet', error.code);
  }
};

// Function to connect to wallet
export const connectWallet = async (walletType: WalletType): Promise<WalletInfo> => {
  if (walletType === 'metamask') {
    return connectMetamask();
  } else if (walletType === 'sui') {
    return connectSuiWallet();
  }
  
  throw new WalletError('Unsupported wallet type', 'UNSUPPORTED_WALLET');
};

// Function to format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';
  
  // Format as 0x123...abc
  return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
};
