import { ReactNode, useState } from 'react';
import { ethers } from 'ethers';
import { WalletContext } from './WalletContext';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connect = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setFormattedAddress(address.slice(0, 6) + '...' + address.slice(-4));
      setSigner(signer);
      setStatus('connected');
      closeModal();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const disconnect = () => {
    setSigner(null);
    setFormattedAddress('');
    setStatus('disconnected');
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <WalletContext.Provider value={{
      status,
      formattedAddress,
      signer,
      isModalOpen,
      openModal,
      closeModal,
      connect,
      disconnect
    }}>
      {children}
    </WalletContext.Provider>
  );
} 