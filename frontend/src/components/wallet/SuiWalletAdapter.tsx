"use client"

import React, { createContext, useContext, useState } from 'react';
import { WalletProvider as SuietWalletProvider, ConnectButton, useWallet } from '@suiet/wallet-kit';
import '@suiet/wallet-kit/style.css';

// Create a context to safely access the Suiet wallet outside of its provider
const SuiWalletContext = createContext({
  isConnected: false,
  address: '',
  connect: async () => null as string | null,
  disconnect: () => {},
  isReady: false,
  wallets: [] as any[]
});

// SuiWalletAdapter component using Suiet wallet kit
export interface SuiWalletAdapterProps {
  children: React.ReactNode;
}

export function SuiWalletAdapter({ children }: SuiWalletAdapterProps) {
  return (
    <SuietWalletProvider>
      <SuiWalletContextProvider>
        {children}
      </SuiWalletContextProvider>
    </SuietWalletProvider>
  );
}

// Provider component that safely wraps Suiet's useWallet
const SuiWalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(true);
  
  // Safely use the Suiet wallet hook
  const walletState = useWallet();
  const { 
    connected = false,
    account = null,
    disconnect: suietDisconnect = () => {},
    select: suietSelect = () => {},
    wallets = []
  } = walletState || {};

  const connect = async () => {
    if (wallets && wallets.length > 0) {
      try {
        suietSelect(wallets[0].name);
        // Return the address if available
        return account?.address || null;
      } catch (error) {
        console.error('Error connecting to Sui wallet:', error);
        return null;
      }
    }
    return null;
  };
  
  // Create the context value
  const contextValue = {
    isConnected: connected,
    address: account?.address || '',
    connect,
    disconnect: suietDisconnect,
    isReady,
    wallets
  };
  
  return (
    <SuiWalletContext.Provider value={contextValue}>
      {children}
    </SuiWalletContext.Provider>
  );
};

// Custom styled connect button that uses Suiet internally
export function SuiConnectButton({ onClick }: { onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#C0C0C0] hover:text-[#D4A84B] border border-[#333333] hover:border-[#D4A84B] py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center cursor-pointer"
    >
      Connect Sui Wallet
    </div>
  );
}

// Custom Sui wallet connect modal that uses Suiet
export function SuiConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="z-10 relative bg-[#1A1A1A] border border-[#333333] rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#333333]">
          <h3 className="text-xl font-bold text-[#C0C0C0]">Connect Wallet</h3>
        </div>
        <div className="p-6">
          <p className="mb-4 text-[#C0C0C0]">Please connect to your Sui Wallet</p>
          <div className="flex justify-center">
            <ConnectButton
              onConnectSuccess={onClose}
              className="!bg-[#2A2A2A] !hover:bg-[#3A3A3A] !text-[#C0C0C0] !hover:text-[#D4A84B] !border !border-[#333333] !hover:border-[#D4A84B] !rounded-md !transition-all !duration-300"
            />
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 p-3 bg-transparent text-[#C0C0C0] hover:text-[#D4A84B] border border-[#333333] hover:border-[#D4A84B] rounded-md transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Safe hook that can be used outside of the Suiet provider
export function useSuiWallet() {
  return useContext(SuiWalletContext);
}
