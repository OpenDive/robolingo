import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

// Helper function to calculate transaction fee (similar to their util function)
function calculateTransactionFee(receipt: any) {
  const gasUsed = receipt.gasUsed;
  const gasPrice = receipt.gasPrice;
  const transactionFee = gasUsed * gasPrice;
  return ethers.formatEther(transactionFee);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Check Hedera-specific environment variables if deploying to Hedera
  if (network.chainId === BigInt(296)) { // Hedera testnet
    if (!process.env.OPERATOR_ACCOUNT_ID || !process.env.OPERATOR_ACCOUNT_PRIVATE_KEY) {
      throw new Error("Please set OPERATOR_ACCOUNT_ID and OPERATOR_ACCOUNT_PRIVATE_KEY in .env for Hedera deployment");
    }
    console.log("Hedera Account ID:", process.env.OPERATOR_ACCOUNT_ID);
  }

  // Deploy contract
  console.log("\nDeploying LearningYieldPool contract...");
  const LearningYieldPool = await ethers.getContractFactory("LearningYieldPool");
  const learningPool = await LearningYieldPool.deploy(
    process.env.USDC_ADDRESS!,
    process.env.AAVE_POOL_ADDRESS!,
    process.env.AUSDC_ADDRESS!,
    process.env.AI_AGENT_ADDRESS!
  );

  const deployTx = await learningPool.deploymentTransaction();
  const deployReceipt = await deployTx?.wait();
  
  const contractAddress = await learningPool.getAddress();
  console.log("Contract deployed to:", contractAddress);

  // Log deployment details
  if (deployReceipt) {
    console.log("Deployment transaction fee:", calculateTransactionFee(deployReceipt), "ETH");
  }

  // Generate HashScan URLs based on network
  if (network.chainId === BigInt(296)) { // Hedera testnet
    const hashscanContractUrl = `https://hashscan.io/testnet/contract/${contractAddress}`;
    const hashscanTxUrl = `https://hashscan.io/testnet/transaction/${deployTx?.hash}`;
    
    console.log("\nHashscan URLs:");
    console.log("Contract:", hashscanContractUrl);
    console.log("Deployment Transaction:", hashscanTxUrl);

    // Wait a bit and verify the contract exists on HashScan
    console.log("\nWaiting for contract to be indexed on HashScan...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }

  // Test contract deployment with a read operation
  try {
    const owner = await learningPool.owner();
    console.log("\nContract verification - Owner address:", owner);
    console.log("✅ Contract deployed and verified successfully");
  } catch (error) {
    console.error("❌ Contract deployment verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 