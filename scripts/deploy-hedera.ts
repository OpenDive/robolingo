import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Check environment variables
  if (!process.env.OPERATOR_ACCOUNT_ID || !process.env.OPERATOR_ACCOUNT_PRIVATE_KEY) {
    throw new Error("Please set OPERATOR_ACCOUNT_ID and OPERATOR_ACCOUNT_PRIVATE_KEY in .env");
  }

  console.log("Deploying contracts with account:", process.env.OPERATOR_ACCOUNT_ID);

  // Get the contract factory
  const LearningYieldPool = await ethers.getContractFactory("LearningYieldPool");
  
  // Deploy the contract
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