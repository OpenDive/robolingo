import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

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