import { SuiClient } from '@mysten/sui/client';
import { WalletAccount } from '@mysten/wallet-standard';

declare global {
  // Wallet Standard interface for Sui
  interface SuiWalletStandard {
    supportedFeatures: string[];
    version: string;
    name: string;
    icon: string;
    accounts: WalletAccount[];
    chains: string[];
    getAccounts(): WalletAccount[];
    connect(): Promise<WalletAccount[]>;
    disconnect(): Promise<void>;
    signAndExecuteTransaction(transaction: any): Promise<any>;
  }

  // Legacy Sui Wallet interface (may be removed in future)
  interface LegacySuiWallet {
    requestPermissions(): Promise<any>;
    getAccounts(): Promise<string[]>;
    executeMoveCall(params: any): Promise<any>;
    executeSerializedMoveCall(params: any): Promise<any>;
    signTransaction(transaction: any): Promise<any>;
  }

  interface Window {
    // For MetaMask
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
    
    // For Legacy Sui Wallet
    suiWallet?: LegacySuiWallet;
    
    // For Wallet Standard compliant wallets
    suiWallets?: SuiWalletStandard[];
  }
}

export {};
