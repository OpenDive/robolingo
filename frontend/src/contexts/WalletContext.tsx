"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { WalletInfo, WalletStatus, WalletType, connectWallet, WalletError, formatAddress } from '@/utils/wallet'

interface WalletContextType {
  connect: (walletType: WalletType) => Promise<void>
  disconnect: () => void
  walletInfo: WalletInfo | null
  status: WalletStatus
  error: string | null
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  formattedAddress: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [status, setStatus] = useState<WalletStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Connect to wallet
  const connect = async (walletType: WalletType) => {
    try {
      setStatus('connecting')
      setError(null)
      
      const info = await connectWallet(walletType)
      setWalletInfo(info)
      setStatus('connected')
      
      // Store wallet info in localStorage
      localStorage.setItem('walletInfo', JSON.stringify({
        address: info.address,
        type: info.type
      }))
      
      // Close modal after successful connection
      setIsModalOpen(false)
    } catch (error) {
      if (error instanceof WalletError) {
        setError(error.message)
      } else {
        setError('Failed to connect to wallet')
      }
      setStatus('error')
    }
  }
  
  // Disconnect from wallet
  const disconnect = () => {
    setWalletInfo(null)
    setStatus('disconnected')
    setError(null)
    
    // Remove wallet info from localStorage
    localStorage.removeItem('walletInfo')
  }
  
  // Open wallet modal
  const openModal = () => {
    setIsModalOpen(true)
  }
  
  // Close wallet modal
  const closeModal = () => {
    setIsModalOpen(false)
  }
  
  // Load wallet info from localStorage on initial render
  useEffect(() => {
    const savedWalletInfo = localStorage.getItem('walletInfo')
    
    if (savedWalletInfo) {
      try {
        const parsed = JSON.parse(savedWalletInfo)
        
        // Reconnect to wallet
        connect(parsed.type as WalletType)
          .catch(() => {
            // If reconnection fails, clear saved info
            localStorage.removeItem('walletInfo')
          })
      } catch (error) {
        // If parsing fails, clear saved info
        localStorage.removeItem('walletInfo')
      }
    }
  }, [])
  
  // Format address for display
  const formattedAddress = walletInfo ? formatAddress(walletInfo.address) : ''
  
  return (
    <WalletContext.Provider
      value={{
        connect,
        disconnect,
        walletInfo,
        status,
        error,
        isModalOpen,
        openModal,
        closeModal,
        formattedAddress
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  
  return context
}
