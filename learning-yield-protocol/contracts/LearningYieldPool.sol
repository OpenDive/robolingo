// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Import Aave interfaces
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {IAToken} from "@aave/core-v3/contracts/interfaces/IAToken.sol";

/**
 * @title LearningYieldPool
 * @dev A smart contract for incentivized learning through pooled yield
 * Users create learning groups, stake USDC, and earn yield based on their progress
 * The pooled USDC is deposited into Aave for yield generation
 */
contract LearningYieldPool is Ownable, ReentrancyGuard {
    IERC20 public usdc;
    IPool public aavePool;
    IAToken public aToken;
    
    struct LearningGroup {
        address creator;
        uint256 stakingAmount;
        uint256 totalStaked;
        uint256 startTime;
        uint256 duration;
        uint256 totalYield;
        bool isActive;
        bool isCompleted;
        mapping(address => UserInfo) users;
        uint256 memberCount;
        uint256 maxMembers;
        address[] members;  // Array to track member addresses
    }

    struct UserInfo {
        bool hasStaked;
        uint256 progressPercentage;
        bool hasClaimedYield;
        uint256 yieldAllocation;
    }

    mapping(uint256 => LearningGroup) public learningGroups;
    uint256 public groupCounter;

    // AI agent address that can update progress
    address public aiAgent;
    
    // Aave pool and aToken addresses
    address public immutable AAVE_POOL;
    address public immutable A_TOKEN;
    
    event GroupCreated(uint256 indexed groupId, address creator, uint256 stakingAmount, uint256 duration);
    event UserStaked(uint256 indexed groupId, address user);
    event UserUnstaked(uint256 indexed groupId, address user);
    event ProgressUpdated(uint256 indexed groupId, address user, uint256 progress);
    event YieldDistributed(uint256 indexed groupId, uint256 totalYield);
    event YieldClaimed(uint256 indexed groupId, address user, uint256 amount);
    event YieldDeposited(uint256 indexed groupId, uint256 amount);
    event YieldWithdrawn(uint256 indexed groupId, uint256 amount, uint256 yield);
    event DebugStakeEntry(uint256 groupId, address sender, uint256 stakingAmount);
    event DebugStakeCheck(bool groupExists, bool isActive, bool hasStaked, uint256 memberCount, uint256 maxMembers);
    event DebugStakeTransfer(bool approvalOk, uint256 allowance, uint256 balance);

    /**
     * @dev Constructor initializes the contract with USDC, Aave Pool, and AI agent addresses
     * @param _usdc Address of the USDC token contract
     * @param _aavePool Address of the Aave lending pool
     * @param _aToken Address of the Aave interest-bearing token for USDC
     * @param _aiAgent Address of the AI agent that updates user progress
     */
    constructor(
        address _usdc,
        address _aavePool,
        address _aToken,
        address _aiAgent
    ) {
        usdc = IERC20(_usdc);
        aavePool = IPool(_aavePool);
        aToken = IAToken(_aToken);
        aiAgent = _aiAgent;
        AAVE_POOL = _aavePool;
        A_TOKEN = _aToken;
    }

    function createLearningGroup(
        uint256 _stakingAmount,
        uint256 _duration,
        uint256 _maxMembers
    ) external returns (uint256) {
        require(_stakingAmount > 0, "Invalid staking amount");
        require(_duration > 0, "Invalid duration");
        require(_maxMembers >= 2, "Minimum 2 members required");

        uint256 groupId = groupCounter++;
        LearningGroup storage group = learningGroups[groupId];
        
        group.creator = msg.sender;
        group.stakingAmount = _stakingAmount;
        group.duration = _duration;
        group.isActive = true;
        group.maxMembers = _maxMembers;

        emit GroupCreated(groupId, msg.sender, _stakingAmount, _duration);
        return groupId;
    }

    /**
     * @dev Stakes USDC into the learning group
     * When the group is full, automatically deposits pooled USDC into Aave
     * @param _groupId ID of the learning group
     */
    function stake(uint256 _groupId) external nonReentrant {
        // Debug initial state
        emit DebugStakeEntry(_groupId, msg.sender, learningGroups[_groupId].stakingAmount);

        // Check if group exists and is valid
        require(_groupId < groupCounter, "Group does not exist");
        LearningGroup storage group = learningGroups[_groupId];
        
        // Debug group checks
        emit DebugStakeCheck(
            _groupId < groupCounter,
            group.isActive,
            group.users[msg.sender].hasStaked,
            group.memberCount,
            group.maxMembers
        );

        require(group.isActive, "Group is not active");
        require(!group.isCompleted, "Group is completed");
        require(!group.users[msg.sender].hasStaked, "Already staked");
        require(group.memberCount < group.maxMembers, "Group is full");

        // Debug transfer checks
        uint256 allowance = usdc.allowance(msg.sender, address(this));
        uint256 balance = usdc.balanceOf(msg.sender);
        emit DebugStakeTransfer(
            allowance >= group.stakingAmount,
            allowance,
            balance
        );

        // Transfer USDC from user to contract
        usdc.transferFrom(msg.sender, address(this), group.stakingAmount);
        
        group.users[msg.sender].hasStaked = true;
        group.totalStaked += group.stakingAmount;
        group.memberCount++;
        group.members.push(msg.sender);  // Add member to array

        // If group is full, deposit total staked amount to Aave
        if (group.memberCount == group.maxMembers) {
            group.startTime = block.timestamp;
            
            // Approve Aave pool to spend USDC
            usdc.approve(AAVE_POOL, group.totalStaked);
            
            // Deposit to Aave
            aavePool.supply(address(usdc), group.totalStaked, address(this), 0);
            
            emit YieldDeposited(_groupId, group.totalStaked);
        }

        emit UserStaked(_groupId, msg.sender);
    }

    function unstakeBeforeStart(uint256 _groupId) external nonReentrant {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isActive, "Group is not active");
        require(group.memberCount < group.maxMembers, "Group has already started");
        require(group.users[msg.sender].hasStaked, "Not staked");

        group.users[msg.sender].hasStaked = false;
        group.totalStaked -= group.stakingAmount;
        group.memberCount--;
        
        usdc.transfer(msg.sender, group.stakingAmount);
        
        emit UserUnstaked(_groupId, msg.sender);
    }

    function updateProgress(
        uint256 _groupId,
        address _user,
        uint256 _progressPercentage
    ) external {
        require(msg.sender == aiAgent, "Only AI agent can update progress");
        require(_progressPercentage <= 100, "Invalid progress percentage");

        LearningGroup storage group = learningGroups[_groupId];
        require(group.isActive, "Group is not active");
        require(group.users[_user].hasStaked, "User has not staked");

        group.users[_user].progressPercentage = _progressPercentage;
        
        emit ProgressUpdated(_groupId, _user, _progressPercentage);
    }

    /**
     * @dev Completes the group and withdraws funds from Aave including earned yield
     * @param _groupId ID of the learning group
     */
    function completeGroupAndDistributeYield(uint256 _groupId) external onlyOwner {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isActive, "Group is not active");
        require(!group.isCompleted, "Group already completed");
        require(
            block.timestamp >= group.startTime + group.duration,
            "Learning period not finished"
        );

        // Calculate total aTokens (including yield) owned by this contract
        uint256 aTokenBalance = aToken.balanceOf(address(this));
        
        // Withdraw everything from Aave
        aavePool.withdraw(address(usdc), aTokenBalance, address(this));
        
        // Calculate actual yield earned
        uint256 totalWithYield = usdc.balanceOf(address(this));
        group.totalYield = totalWithYield - group.totalStaked;
        
        group.isCompleted = true;
        
        emit YieldWithdrawn(_groupId, group.totalStaked, group.totalYield);
        emit YieldDistributed(_groupId, group.totalYield);
    }

    /**
     * @dev Allows users to claim their initial stake plus earned yield based on progress
     * @param _groupId ID of the learning group
     */
    function claimYieldAndUnstake(uint256 _groupId) external nonReentrant {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isCompleted, "Group not completed");
        require(group.users[msg.sender].hasStaked, "Not staked");
        require(!group.users[msg.sender].hasClaimedYield, "Already claimed");

        uint256 progress = group.users[msg.sender].progressPercentage;
        // Calculate total progress across all users
        uint256 totalProgress = 0;
        for (uint256 i = 0; i < group.members.length; i++) {
            totalProgress += group.users[group.members[i]].progressPercentage;
        }
        
        // Calculate yield share based on relative progress
        uint256 yieldShare = (group.totalYield * progress) / totalProgress;

        group.users[msg.sender].hasClaimedYield = true;
        group.users[msg.sender].yieldAllocation = yieldShare;

        // Transfer initial stake plus earned yield share
        usdc.transfer(msg.sender, group.stakingAmount + yieldShare);
        
        emit YieldClaimed(_groupId, msg.sender, yieldShare);
    }

    function setAiAgent(address _newAiAgent) external onlyOwner {
        aiAgent = _newAiAgent;
    }

    // View functions
    function getGroupInfo(uint256 _groupId) external view returns (
        address creator,
        uint256 stakingAmount,
        uint256 totalStaked,
        uint256 startTime,
        uint256 duration,
        uint256 totalYield,
        bool isActive,
        bool isCompleted,
        uint256 memberCount,
        uint256 maxMembers
    ) {
        LearningGroup storage group = learningGroups[_groupId];
        return (
            group.creator,
            group.stakingAmount,
            group.totalStaked,
            group.startTime,
            group.duration,
            group.totalYield,
            group.isActive,
            group.isCompleted,
            group.memberCount,
            group.maxMembers
        );
    }

    function getUserInfo(uint256 _groupId, address _user) external view returns (
        bool hasStaked,
        uint256 progressPercentage,
        bool hasClaimedYield,
        uint256 yieldAllocation
    ) {
        LearningGroup storage group = learningGroups[_groupId];
        UserInfo storage user = group.users[_user];
        return (
            user.hasStaked,
            user.progressPercentage,
            user.hasClaimedYield,
            user.yieldAllocation
        );
    }
}