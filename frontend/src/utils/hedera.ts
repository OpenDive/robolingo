// Hedera Testnet configuration
export const hederaTestnetConfig = {
  chainId: '0x128', // Decimal 296 in hex
  chainName: 'Hedera Testnet',
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18
  },
  rpcUrls: ['https://testnet.hashio.io/api'],
  blockExplorerUrls: ['https://hashscan.io/testnet']
};

// Function to switch MetaMask to Hedera network
export const switchToHederaNetwork = async (ethereum: any): Promise<boolean> => {
  if (!ethereum) return false;
  
  try {
    // First try to switch to the Hedera network
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hederaTestnetConfig.chainId }]
    });
    return true;
  } catch (error: any) {
    // This error code means the chain has not been added to MetaMask
    if (error.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hederaTestnetConfig.chainId,
              chainName: hederaTestnetConfig.chainName,
              nativeCurrency: hederaTestnetConfig.nativeCurrency,
              rpcUrls: hederaTestnetConfig.rpcUrls,
              blockExplorerUrls: hederaTestnetConfig.blockExplorerUrls
            }
          ]
        });
        return true;
      } catch (addError) {
        console.error('Error adding Hedera network to MetaMask:', addError);
        return false;
      }
    }
    // User rejected the request
    if (error.code === 4001) {
      console.log('User rejected the request to switch networks');
      return false;
    }
    console.error('Error switching to Hedera network:', error);
    return false;
  }
};
