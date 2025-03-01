import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as hre from "hardhat";

dotenv.config();

// Helper function to calculate transaction fee
function calculateTransactionFee(receipt: any) {
  const gasUsed = receipt.gasUsed;
  const gasPrice = receipt.gasPrice;
  const transactionFee = gasUsed * gasPrice;
  return ethers.formatEther(transactionFee) + " ℏ"; // Add Hedera token symbol
}

// Helper function to wait for RPC connection
async function waitForRPC(provider: any, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await provider.getNetwork();
      return true;
    } catch (error) {
      console.log(`RPC connection attempt ${i + 1}/${maxAttempts} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
    }
  }
  return false;
}

async function main() {
  // Initialize the operator account and RPC connection like in the example
  const operatorId = process.env.OPERATOR_ACCOUNT_ID;
  const operatorKey = process.env.OPERATOR_ACCOUNT_PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL;

  if (!operatorId || !operatorKey || !rpcUrl) {
    throw new Error('Must set OPERATOR_ACCOUNT_ID, OPERATOR_ACCOUNT_PRIVATE_KEY, and RPC_URL environment variables');
  }

  console.log("\n🟣 Initializing operator account...");
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const operatorWallet = new ethers.Wallet(operatorKey, provider);
  const operatorAddress = operatorWallet.address;

  console.log("Operator account initialized:", operatorAddress);
  console.log("Hedera Account ID:", operatorId);

  // Validate contract addresses
  const usdcAddress = process.env.USDC_ADDRESS;
  const aavePoolAddress = process.env.AAVE_POOL_ADDRESS;
  const aUsdcAddress = process.env.AUSDC_ADDRESS;
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;

  if (!usdcAddress || !aavePoolAddress || !aUsdcAddress || !aiAgentAddress) {
    throw new Error("Missing required contract addresses in .env");
  }

  // Deploy contract
  console.log("\n🟣 Deploying LearningYieldPool contract...");
  console.log("Using addresses:");
  console.log("USDC:", usdcAddress);
  console.log("Aave Pool:", aavePoolAddress);
  console.log("aUSDC:", aUsdcAddress);
  console.log("AI Agent:", aiAgentAddress);

  const artifact = await hre.artifacts.readArtifact("LearningYieldPool");
  const LearningYieldPool = ethers.ContractFactory.fromSolidity(
    artifact,
    operatorWallet
  );
  
  try {
    const learningPool = await LearningYieldPool.deploy(
      usdcAddress,
      aavePoolAddress,
      aUsdcAddress,
      aiAgentAddress,
      { 
        gasLimit: 300000, // Use DEFAULT_GAS_LIMIT from .rpcrelay.env
      }
    );

    const deployTx = await learningPool.deploymentTransaction();
    if (!deployTx) throw new Error("No deployment transaction found");
    
    console.log("\n🟣 Waiting for deployment transaction...");
    const deployReceipt = await deployTx.wait();
    if (!deployReceipt) throw new Error("No deployment receipt found");

    const contractAddress = await learningPool.getAddress();
    console.log("\nContract deployed to:", contractAddress);
    console.log("Deployment transaction fee:", calculateTransactionFee(deployReceipt));

    // Generate HashScan URLs
    const hashscanContractUrl = `https://hashscan.io/testnet/contract/${contractAddress}`;
    const hashscanTxUrl = `https://hashscan.io/testnet/transaction/${deployTx.hash}`;
    
    console.log("\n🟣 HashScan URLs:");
    console.log("Contract:", hashscanContractUrl);
    console.log("Deployment Transaction:", hashscanTxUrl);

    // Wait for contract to be indexed
    console.log("\n🟣 Waiting for contract to be indexed on HashScan...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify deployment with a read operation
    try {
      const owner = await learningPool.owner();
      console.log("\nContract verification - Owner address:", owner);
      console.log("✅ Contract deployed and verified successfully");

      // Optional: Write a test transaction like in the example
      console.log("\n🟣 Testing contract with a write operation...");
      const testTx = await learningPool.createLearningGroup(
        ethers.parseUnits("100", 6), // 100 USDC
        86400, // 1 day duration
        2 // max members
      );
      const testReceipt = await testTx.wait();
      console.log("Test transaction fee:", calculateTransactionFee(testReceipt));
      console.log("Test transaction hash:", testTx.hash);
      console.log("Test transaction HashScan URL:");
      console.log(`https://hashscan.io/testnet/transaction/${testTx.hash}`);

    } catch (error) {
      console.error("❌ Contract deployment verification failed:", error);
    }
  } catch (error: any) {
    console.error("\n❌ Deployment failed:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 