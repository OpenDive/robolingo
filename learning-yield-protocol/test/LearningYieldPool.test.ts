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
}); 