import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as hre from "hardhat";

dotenv.config();

const DEPLOYED_CONTRACT = "0x60E555c1386D001ac2f85Ce69D01f0301fc88dD9";
const USDC_DECIMALS = 6;

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const operatorWallet = new ethers.Wallet(process.env.OPERATOR_ACCOUNT_PRIVATE_KEY!, provider);
  
  const artifact = await hre.artifacts.readArtifact("LearningYieldPool");
  const learningPool = new ethers.Contract(DEPLOYED_CONTRACT, artifact.abi, operatorWallet);

  try {
    // 1. Complete group and distribute yield
    console.log("\n🟣 Completing group and distributing yield...");
    const groupId = 1; // Use the group ID from previous test
    
    const completeTx = await learningPool.completeGroupAndDistributeYield(groupId, { gasLimit: 1000000 });
    await completeTx.wait();
    console.log("Group completed! Transaction:", completeTx.hash);

    // 2. Check yield allocation
    const userInfo = await learningPool.getUserInfo(groupId, operatorWallet.address);
    console.log("\nYield Allocation:", ethers.formatUnits(userInfo[3], USDC_DECIMALS), "USDC");

    // 3. Claim yield and unstake
    console.log("\n🟣 Claiming yield and unstaking...");
    const claimTx = await learningPool.claimYieldAndUnstake(groupId, { gasLimit: 1000000 });
    await claimTx.wait();
    console.log("Yield claimed! Transaction:", claimTx.hash);

    console.log("\n✅ Yield distribution test completed!");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
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