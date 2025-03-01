import { WalletStandardAdapterProvider } from '@mysten/wallet-standard';

declare global {
  interface Window {
    // For MetaMask
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, listener: (...args: any[]) => void) => void;
      removeListener: (event: string, listener: (...args: any[]) => void) => void;
    };
    
    // For Sui Wallet
    suiWallet?: {
      requestPermissions: () => Promise<any>;
      getAccounts: () => Promise<string[]>;
      signAndExecuteTransaction: (transaction: any) => Promise<any>;
    };
  }
}

export {};
