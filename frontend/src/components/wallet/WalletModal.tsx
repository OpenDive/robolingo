"use client"

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import Image from 'next/image'
import { SuiConnectModal } from './SuiWalletAdapter'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: 'metamask' | 'sui') => void
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [showSuiModal, setShowSuiModal] = useState(false);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null
  
  const handleSuiConnect = () => {
    // Show the Sui wallet modal which will handle the actual connection
    setShowSuiModal(true);
  };
  
  const handleCloseSuiModal = () => {
    setShowSuiModal(false);
    // Signal to the parent that Sui wallet is being connected
    onConnect('sui');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative z-10 bg-[#1A1A1A] border border-[#333333] rounded-lg w-full max-w-md overflow-hidden shadow-xl transform transition-all">
          {/* Content */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Select a wallet</h3>
              <button 
                onClick={onClose}
                className="text-[#C0C0C0] hover:text-[#D4A84B] transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Metamask Option */}
              <button
                onClick={() => onConnect('metamask')}
                className="w-full flex items-center justify-between p-4 border border-[#333333] hover:border-[#D4A84B] rounded-lg bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 group transition-all duration-300 relative overflow-hidden"
              >
                <h4 className="text-white text-lg font-semibold group-hover:text-[#D4A84B] transition-colors">MetaMask</h4>
                <div className="h-10 w-10 flex items-center justify-center">
                  <Image src="/images/metamask.png" alt="Metamask Logo" width={40} height={40} />
                </div>
              </button>
              
              {/* Sui Wallet Option */}
              <button
                onClick={handleSuiConnect}
                className="w-full flex items-center justify-between p-4 border border-[#333333] hover:border-[#D4A84B] rounded-lg bg-[#2A2A2A] hover:bg-[#2A2A2A]/80 group transition-all duration-300 relative overflow-hidden"
              >
                <h4 className="text-white text-lg font-semibold group-hover:text-[#D4A84B] transition-colors">Sui Wallet</h4>
                <div className="h-10 w-10 flex items-center justify-center">
                  <Image src="/images/suiwallet.png" alt="Sui Wallet Logo" width={40} height={40} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sui Wallet Connection Modal */}
      <SuiConnectModal isOpen={showSuiModal} onClose={handleCloseSuiModal} />
    </>
  )
}
