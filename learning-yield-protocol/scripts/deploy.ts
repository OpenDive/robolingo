import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

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

  const LearningYieldPool = await ethers.getContractFactory("LearningYieldPool");
  const learningPool = await LearningYieldPool.deploy(
    process.env.USDC_ADDRESS!,
    process.env.AAVE_POOL_ADDRESS!,
    process.env.AUSDC_ADDRESS!,
    process.env.AI_AGENT_ADDRESS!
  );

  await learningPool.waitForDeployment();

  console.log("LearningYieldPool deployed to:", await learningPool.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 