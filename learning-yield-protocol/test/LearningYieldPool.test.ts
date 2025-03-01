import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LearningYieldPool", function () {
  let learningPool: any;
  let mockUSDC: any;
  let mockAavePool: any;
  let mockAToken: any;
  let owner: SignerWithAddress;
  let aiAgent: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, aiAgent, user1, user2] = await ethers.getSigners();

    // Deploy mock tokens and Aave contracts
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockToken.deploy("Mock USDC", "USDC", 6);

    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    mockAavePool = await MockAavePool.deploy();

    const MockAToken = await ethers.getContractFactory("MockAToken");
    mockAToken = await MockAToken.deploy();

    // Deploy LearningYieldPool
    const LearningYieldPool = await ethers.getContractFactory("LearningYieldPool");
    learningPool = await LearningYieldPool.deploy(
      await mockUSDC.getAddress(),
      await mockAavePool.getAddress(),
      await mockAToken.getAddress(),
      aiAgent.address
    );
  });

  describe("Group Creation", function () {
    it("Should create a learning group with correct parameters", async function () {
      const stakingAmount = ethers.parseUnits("100", 6); // 100 USDC
      const duration = 7 * 24 * 60 * 60; // 1 week
      const maxMembers = 5;

      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);

      const groupInfo = await learningPool.getGroupInfo(0);
      
      expect(groupInfo.creator).to.equal(owner.address);
      expect(groupInfo.stakingAmount).to.equal(stakingAmount);
      expect(groupInfo.duration).to.equal(duration);
      expect(groupInfo.maxMembers).to.equal(maxMembers);
      expect(groupInfo.isActive).to.be.true;
      expect(groupInfo.isCompleted).to.be.false;
    });

    it("Should revert when creating group with invalid parameters", async function () {
      await expect(
        learningPool.createLearningGroup(0, 86400, 2)
      ).to.be.revertedWith("Invalid staking amount");

      await expect(
        learningPool.createLearningGroup(1000, 0, 2)
      ).to.be.revertedWith("Invalid duration");

      await expect(
        learningPool.createLearningGroup(1000, 86400, 1)
      ).to.be.revertedWith("Minimum 2 members required");
    });
  });

  describe("Staking", function () {
    const stakingAmount = ethers.parseUnits("100", 6);
    const duration = 86400;
    const maxMembers = 2;

    beforeEach(async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      // Mint and approve USDC for users
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      await mockUSDC.mint(user2.address, stakingAmount);
      await mockUSDC.connect(user2).approve(learningPool.getAddress(), stakingAmount);
    });

    it("Should allow users to stake", async function () {
      await learningPool.connect(user1).stake(0);
      
      const userInfo = await learningPool.getUserInfo(0, user1.address);
      expect(userInfo.hasStaked).to.be.true;
      
      const groupInfo = await learningPool.getGroupInfo(0);
      expect(groupInfo.totalStaked).to.equal(stakingAmount);
      expect(groupInfo.memberCount).to.equal(1);
    });

    it("Should not allow double staking", async function () {
      await learningPool.connect(user1).stake(0);
      await expect(
        learningPool.connect(user1).stake(0)
      ).to.be.revertedWith("Already staked");
    });
  });

  describe("Progress Updates and Yield Distribution", function () {
    const stakingAmount = ethers.parseUnits("100", 6);
    const duration = 86400;
    const maxMembers = 2;
    
    beforeEach(async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      // Setup both users
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      await mockUSDC.mint(user2.address, stakingAmount);
      await mockUSDC.connect(user2).approve(learningPool.getAddress(), stakingAmount);
      
      // Both users stake
      await learningPool.connect(user1).stake(0);
      await learningPool.connect(user2).stake(0);
    });

    it("Should only allow AI agent to update progress", async function () {
      await expect(
        learningPool.connect(user1).updateProgress(0, user1.address, 50)
      ).to.be.revertedWith("Only AI agent can update progress");

      await learningPool.connect(aiAgent).updateProgress(0, user1.address, 50);
      const userInfo = await learningPool.getUserInfo(0, user1.address);
      expect(userInfo.progressPercentage).to.equal(50);
    });

    it("Should not allow progress updates above 100%", async function () {
      await expect(
        learningPool.connect(aiAgent).updateProgress(0, user1.address, 101)
      ).to.be.revertedWith("Invalid progress percentage");
    });

    it("Should distribute yield correctly based on progress", async function () {
      // Set different progress for users
      await learningPool.connect(aiAgent).updateProgress(0, user1.address, 100);
      await learningPool.connect(aiAgent).updateProgress(0, user2.address, 50);

      // Mock some yield by minting additional aTokens
      const yieldAmount = ethers.parseUnits("20", 6);
      await mockAToken.mint(learningPool.getAddress(), yieldAmount);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [duration]);
      await ethers.provider.send("evm_mine", []);

      // Mock USDC balance after Aave withdrawal (only mint the yield amount)
      await mockUSDC.mint(learningPool.getAddress(), yieldAmount);

      // Complete group and distribute yield
      await learningPool.connect(owner).completeGroupAndDistributeYield(0);

      // User1 claims (100% progress out of 150% total = 2/3 of yield)
      await learningPool.connect(user1).claimYieldAndUnstake(0);
      const user1Balance = await mockUSDC.balanceOf(user1.address);
      expect(user1Balance).to.equal(stakingAmount + (yieldAmount * BigInt(100) / BigInt(150)));

      // User2 claims (50% progress out of 150% total = 1/3 of yield)
      await learningPool.connect(user2).claimYieldAndUnstake(0);
      const user2Balance = await mockUSDC.balanceOf(user2.address);
      expect(user2Balance).to.equal(stakingAmount + (yieldAmount * BigInt(50) / BigInt(150)));
    });
  });

  describe("Group Completion and Edge Cases", function () {
    const stakingAmount = ethers.parseUnits("100", 6);
    const duration = 86400;
    const maxMembers = 2;

    it("Should allow unstaking before group starts", async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      
      await learningPool.connect(user1).stake(0);
      const balanceBefore = await mockUSDC.balanceOf(user1.address);
      
      await learningPool.connect(user1).unstakeBeforeStart(0);
      const balanceAfter = await mockUSDC.balanceOf(user1.address);
      
      expect(balanceAfter).to.equal(balanceBefore + stakingAmount);
    });

    it("Should not allow unstaking after group is full", async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      
      // Setup and stake for both users
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      await mockUSDC.mint(user2.address, stakingAmount);
      await mockUSDC.connect(user2).approve(learningPool.getAddress(), stakingAmount);
      
      await learningPool.connect(user1).stake(0);
      await learningPool.connect(user2).stake(0);

      await expect(
        learningPool.connect(user1).unstakeBeforeStart(0)
      ).to.be.revertedWith("Group has already started");
    });

    it("Should not allow completion before duration ends", async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      
      // Setup and stake for both users
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      await mockUSDC.mint(user2.address, stakingAmount);
      await mockUSDC.connect(user2).approve(learningPool.getAddress(), stakingAmount);
      
      await learningPool.connect(user1).stake(0);
      await learningPool.connect(user2).stake(0);

      await expect(
        learningPool.connect(owner).completeGroupAndDistributeYield(0)
      ).to.be.revertedWith("Learning period not finished");
    });

    it("Should not allow double yield claims", async function () {
      await learningPool.createLearningGroup(stakingAmount, duration, maxMembers);
      
      // Setup and stake for both users
      await mockUSDC.mint(user1.address, stakingAmount);
      await mockUSDC.connect(user1).approve(learningPool.getAddress(), stakingAmount);
      await mockUSDC.mint(user2.address, stakingAmount);
      await mockUSDC.connect(user2).approve(learningPool.getAddress(), stakingAmount);
      
      await learningPool.connect(user1).stake(0);
      await learningPool.connect(user2).stake(0);

      // Set progress for both users
      await learningPool.connect(aiAgent).updateProgress(0, user1.address, 50);
      await learningPool.connect(aiAgent).updateProgress(0, user2.address, 50);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [duration]);
      await ethers.provider.send("evm_mine", []);

      // Mock some yield
      const yieldAmount = ethers.parseUnits("20", 6);
      await mockUSDC.mint(learningPool.getAddress(), yieldAmount);

      await learningPool.connect(owner).completeGroupAndDistributeYield(0);
      await learningPool.connect(user1).claimYieldAndUnstake(0);

      await expect(
        learningPool.connect(user1).claimYieldAndUnstake(0)
      ).to.be.revertedWith("Already claimed");
    });
  });
}); 