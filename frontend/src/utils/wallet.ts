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
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'WalletError';
  }
}

// Function to connect to MetaMask
export const connectMetaMask = async (): Promise<WalletInfo> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new WalletError('MetaMask not installed', 'METAMASK_NOT_INSTALLED');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // Get chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    return {
      address,
      chainId,
      provider: window.ethereum,
      type: 'metamask'
    };
  } catch (error: any) {
    if (error.code === 4001) {
      // User rejected request
      throw new WalletError('User rejected the connection request', 'USER_REJECTED');
    }

    throw new WalletError(error.message || 'Unknown error', 'UNKNOWN_ERROR');
  }
};

// Function to connect to Sui Wallet
export const connectSuiWallet = async (): Promise<WalletInfo> => {
  if (typeof window === 'undefined') {
    throw new WalletError('Browser environment required', 'BROWSER_REQUIRED');
  }

  // Note: This function is kept for backward compatibility.
  // The preferred way to connect is now through the dApp-kit integration.
  // This will be called as a fallback if the dApp-kit connection fails.

  if (!window.suiWallet) {
    throw new WalletError('Sui Wallet not installed', 'SUI_WALLET_NOT_INSTALLED');
  }

  try {
    // Request permissions
    await window.suiWallet.requestPermissions();

    // Get accounts
    const accounts = await window.suiWallet.getAccounts();

    if (!accounts || accounts.length === 0) {
      throw new WalletError('No accounts found', 'NO_ACCOUNTS');
    }

    const address = accounts[0];

    return {
      address,
      chainId: 'sui', // Sui doesn't use chainId in the same way
      provider: window.suiWallet,
      type: 'sui'
    };
  } catch (error: any) {
    if (error.code === 4001 || error.message?.includes('rejected')) {
      // User rejected request
      throw new WalletError('User rejected the connection request', 'USER_REJECTED');
    }

    throw new WalletError(error.message || 'Unknown error connecting to Sui Wallet', 'UNKNOWN_ERROR');
  }
};

// Function to connect to wallet
export const connectWallet = async (walletType: WalletType): Promise<WalletInfo> => {
  if (typeof window === 'undefined') {
    throw new WalletError('Browser environment required', 'BROWSER_REQUIRED');
  }

  switch (walletType) {
    case 'metamask':
      return connectMetaMask();
    case 'sui':
      return connectSuiWallet();
    default:
      throw new WalletError(`Unsupported wallet type: ${walletType}`, 'UNSUPPORTED_WALLET');
  }
};

// Function to format address for display
export const formatAddress = (address: string): string => {
  if (!address) return '';

  // Format as 0x123...abc
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
