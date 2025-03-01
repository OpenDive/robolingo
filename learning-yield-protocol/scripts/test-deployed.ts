import { ethers, artifacts } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const DEPLOYED_CONTRACT = "0x60E555c1386D001ac2f85Ce69D01f0301fc88dD9";
const USDC_DECIMALS = 6;

async function main() {
  // Setup connection
  const rpcUrl = process.env.RPC_URL;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const operatorWallet = new ethers.Wallet(process.env.OPERATOR_ACCOUNT_PRIVATE_KEY!, provider);
  
  console.log("\n🟣 Connecting to deployed contract...");
  const artifact = await artifacts.readArtifact("LearningYieldPool");
  
  // Log the stake function signature from ABI to verify encoding
  const stakeFunction = artifact.abi.find(item => item.name === "stake");
  console.log("\nStake function signature:", stakeFunction);
  
  const learningPool = new ethers.Contract(
    DEPLOYED_CONTRACT, 
    artifact.abi,
    operatorWallet
  );
  
  try {
    // 1. Test Group Creation
    console.log("\n🟣 Creating a learning group...");
    const stakingAmount = ethers.parseUnits("0.1", USDC_DECIMALS); // 0.1 USDC instead of 10
    const duration = 24 * 60 * 60; // 1 day in seconds
    const maxMembers = 3;
    
    const createTx = await learningPool.createLearningGroup(
      stakingAmount,
      duration,
      maxMembers,
      { gasLimit: 1000000 }
    );
    await createTx.wait();
    console.log("Group created! Transaction:", createTx.hash);
    
    // Get latest group ID by checking the event logs
    const receipt = await createTx.wait();
    
    // Add type safety for the log
    interface Log {
      topics: string[];
      data: string;
    }
    
    // Get the first log's second topic (which should be the group ID)
    const logs = receipt.logs as Log[];
    if (logs.length === 0) {
      throw new Error("No logs found in transaction receipt");
    }
    
    // The group ID should be in the first log's second topic
    const groupId = logs[0].topics.length > 1 ? 
      Number(ethers.toBigInt(logs[0].topics[1])) : 0;
    
    console.log("\nGroup ID:", groupId);
    
    const groupInfo = await learningPool.learningGroups(groupId);
    console.log("\nGroup Info:");
    console.log("Creator:", groupInfo[0]);
    console.log("Staking Amount:", ethers.formatUnits(groupInfo[1], USDC_DECIMALS), "USDC");
    console.log("Duration:", Number(groupInfo[4]) / 3600, "hours");
    console.log("Max Members:", groupInfo[9]);

    // 2. Test USDC Approval & Staking
    console.log("\n🟣 Approving USDC spend...");
    
    // Log the USDC address we're trying to interact with
    console.log("USDC Address:", process.env.USDC_ADDRESS);

    // USDC Token on Hedera Testnet (0.0.5449)
    const USDC_ABI = [
      // HTS Token Standard functions
      "function associate()",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
      "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function transfer(address recipient, uint256 amount) returns (bool)",
      "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)"
    ];

    const usdcContract = new ethers.Contract(
      process.env.USDC_ADDRESS!, // EVM address for token 0.0.5449
      USDC_ABI,
      operatorWallet
    );

    try {
      // First check if we need to associate the token
      console.log("\n🟣 Checking token association...");
      try {
        await usdcContract.associate({ gasLimit: 1000000 });
        console.log("Token associated successfully!");
      } catch (error: any) {
        if (!error.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
          console.log("Token already associated");
        } else {
          throw error;
        }
      }

      // Then check balance
      const initialBalance = await usdcContract.balanceOf(operatorWallet.address);
      console.log("\nInitial USDC Balance:", ethers.formatUnits(initialBalance, USDC_DECIMALS), "USDC");

      // Then approve
      const approveTx = await usdcContract.approve(
        DEPLOYED_CONTRACT, 
        stakingAmount,
        { gasLimit: 1000000 }
      );
      await approveTx.wait();
      console.log("USDC approved! Transaction:", approveTx.hash);

    } catch (error: any) {
      console.error("USDC interaction failed:", error.message);
      throw error;
    }

    // Check contract's USDC balance
    const contractBalance = await usdcContract.balanceOf(DEPLOYED_CONTRACT);
    console.log("\nContract USDC Balance:", ethers.formatUnits(contractBalance, USDC_DECIMALS), "USDC");

    // 3. Test Staking
    console.log("\n🟣 Staking in group...");
    try {
      // Check allowance first
      const allowance = await usdcContract.allowance(operatorWallet.address, DEPLOYED_CONTRACT);
      console.log("Current allowance:", ethers.formatUnits(allowance, USDC_DECIMALS), "USDC");

      // Check USDC balance again
      const balance = await usdcContract.balanceOf(operatorWallet.address);
      console.log("Current USDC Balance:", ethers.formatUnits(balance, USDC_DECIMALS), "USDC");

      if (balance < stakingAmount) {
        throw new Error(`Insufficient USDC balance. Need ${ethers.formatUnits(stakingAmount, USDC_DECIMALS)} USDC but have ${ethers.formatUnits(balance, USDC_DECIMALS)} USDC`);
      }

      // Try staking with proper method encoding
      console.log("Attempting to stake...");
      
      // Log the contract interface to verify ABI
      console.log("\nContract interface for stake:", learningPool.interface.getFunction("stake"));
      
      // Encode the function call data
      const data = learningPool.interface.encodeFunctionData("stake", [groupId]);
      console.log("\nEncoded function data:", data);
      
      // Call stake with proper encoding
      const stakeTx = await learningPool.stake(
        groupId,
        {
          gasLimit: 1000000,
          gasPrice: ethers.parseUnits("360", "gwei")
        }
      );

      console.log("Staking transaction sent:", stakeTx.hash);
      const receipt = await stakeTx.wait();
      
      if (receipt.status === 0) {
        throw new Error("Staking transaction failed");
      }

      console.log("Staked successfully! Transaction:", stakeTx.hash);

    } catch (error: any) {
      console.error("Staking failed:", error.message);
      if (error.transaction) {
        console.error("Transaction details:", {
          from: error.transaction.from,
          to: error.transaction.to,
          data: error.transaction.data,
          value: error.transaction.value
        });
      }
      throw error;
    }

    // 4. Test Progress Update (as AI agent)
    console.log("\n🟣 Updating progress...");
    const progress = 75; // 75% progress
    const updateTx = await learningPool.updateProgress(groupId, operatorWallet.address, progress, { gasLimit: 1000000 });
    await updateTx.wait();
    console.log("Progress updated! Transaction:", updateTx.hash);

    // 5. Check User Info
    const userInfo = await learningPool.getUserInfo(groupId, operatorWallet.address);
    console.log("\nUser Info:");
    console.log("Has Staked:", userInfo[0]);
    console.log("Progress:", userInfo[1], "%");
    console.log("Has Claimed Yield:", userInfo[2]);
    console.log("Yield Allocation:", ethers.formatUnits(userInfo[3], USDC_DECIMALS), "USDC");

    console.log("\n✅ All tests completed successfully!");

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