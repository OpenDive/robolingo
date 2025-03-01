"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useWalletContext } from '@/contexts/WalletContext'
import WalletModal from '@/components/wallet/WalletModal'

export default function Header() {
  const { 
    status, 
    formattedAddress, 
    openModal, 
    isModalOpen, 
    closeModal, 
    connect, 
    disconnect 
  } = useWalletContext()
  
  const isConnected = status === 'connected'
  
  const handleConnectWallet = () => {
    if (isConnected) {
      disconnect()
    } else {
      openModal()
    }
  }
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-blueprint-line relative">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blueprint-bg border-1 border-blueprint-line rounded-lg flex items-center justify-center text-blueprint-line text-2xl font-bold mr-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-blueprint-grid opacity-30"></div>
          <span className="relative z-10 blueprint-heading">W</span>
        </div>
        <h1 className="text-xl font-bold blueprint-heading">W with Friends</h1>
      </div>
      
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-20 opacity-10">
        <div className="w-full h-full bg-blueprint-line" style={{ maskImage: 'url(/images/floral-pattern.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }}></div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 blueprint-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-blueprint-line text-blueprint-bg text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse-slow">
            3
          </span>
        </div>
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 blueprint-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        
        <button 
          onClick={handleConnectWallet}
          className={`flex items-center space-x-2 py-2 px-4 rounded-full border-1 transition-all duration-300 relative overflow-hidden group ${
            isConnected 
              ? 'bg-[#D4A84B] text-[#1A1A1A] border-[#B38728]' 
              : 'bg-transparent text-blueprint-line border-blueprint-line hover:border-[#D4A84B]'
          }`}
        >
          {/* Mechanical floral decoration */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
            <div className="w-full h-full animate-spin-slow" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          
          {/* Gear connection points */}
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 opacity-70">
            <div className="w-full h-full animate-gear-rotate" style={{ 
              backgroundImage: 'url(/images/floral-pattern.svg)', 
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}></div>
          </div>
          
          <span className={`font-mono text-sm ${isConnected ? 'text-[#1A1A1A]' : 'text-blueprint-line group-hover:text-[#D4A84B]'} transition-colors duration-300`}>
            {isConnected ? formattedAddress : 'Connect Wallet'}
          </span>
          
          {/* Connection indicator */}
          {isConnected && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          )}
        </button>
      </div>
      
      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onConnect={connect} 
      />
    </header>
  )
}