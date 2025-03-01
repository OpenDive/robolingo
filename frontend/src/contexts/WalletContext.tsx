"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { WalletInfo, WalletStatus, WalletType, connectWallet, WalletError, formatAddress } from '@/utils/wallet'
import { useSuiWallet } from '@/components/wallet/SuiWalletAdapter'

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
  
  // Get Sui wallet state
  const suiWallet = useSuiWallet()
  
  // Connect to wallet
  const connect = async (walletType: WalletType) => {
    try {
      setStatus('connecting')
      setError(null)
      
      if (walletType === 'sui') {
        // If Sui wallet is connected through our custom hook, use that
        const address = await suiWallet.connect()
        
        if (address) {
          const info: WalletInfo = {
            address,
            chainId: 'sui', // Sui doesn't use chainId in the same way
            provider: suiWallet,
            type: 'sui'
          }
          
          setWalletInfo(info)
          setStatus('connected')
          
          // Store wallet info in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('walletInfo', JSON.stringify({
              address: info.address,
              type: info.type
            }))
          }
          
          // Close modal after successful connection
          setIsModalOpen(false)
          return
        }
      }
      
      // Fallback to the original connectWallet method for Metamask
      const info = await connectWallet(walletType)
      setWalletInfo(info)
      setStatus('connected')
      
      // Store wallet info in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('walletInfo', JSON.stringify({
          address: info.address,
          type: info.type
        }))
      }
      
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
    // If connected to Sui wallet, use its disconnect method
    if (walletInfo?.type === 'sui') {
      suiWallet.disconnect()
    }
    
    setWalletInfo(null)
    setStatus('disconnected')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletInfo')
    }
  }
  
  // Update wallet info if Sui wallet connects/disconnects through our custom hook
  useEffect(() => {
    if (suiWallet.isConnected && suiWallet.address) {
      // Update wallet info if not already connected
      if (!walletInfo || walletInfo.type !== 'sui' || walletInfo.address !== suiWallet.address) {
        const info: WalletInfo = {
          address: suiWallet.address,
          chainId: 'sui',
          provider: suiWallet,
          type: 'sui'
        }
        
        setWalletInfo(info)
        setStatus('connected')
        
        // Store wallet info in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('walletInfo', JSON.stringify({
            address: info.address,
            type: info.type
          }))
        }
      }
    } else if (walletInfo?.type === 'sui' && !suiWallet.isConnected) {
      // Disconnect if Sui wallet was connected but now isn't
      setWalletInfo(null)
      setStatus('disconnected')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('walletInfo')
      }
    }
  }, [suiWallet.isConnected, suiWallet.address, walletInfo])
  
  // Load saved wallet info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWalletInfo = localStorage.getItem('walletInfo')
      
      if (savedWalletInfo) {
        try {
          const { address, type } = JSON.parse(savedWalletInfo)
          
          // Otherwise connect to the saved wallet
          connect(type as WalletType)
        } catch (error) {
          console.error('Failed to parse saved wallet info', error)
        }
      }
    }
  }, [])
  
  // Modal handlers
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  
  // Format address for display
  const formattedAddress = walletInfo ? formatAddress(walletInfo.address) : ''
  
  return (
    <WalletContext.Provider value={{
      connect,
      disconnect,
      walletInfo,
      status,
      error,
      isModalOpen,
      openModal,
      closeModal,
      formattedAddress
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}
