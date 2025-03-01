// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LearningYieldPool is Ownable, ReentrancyGuard {
    IERC20 public usdc;
    
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
    
    event GroupCreated(uint256 indexed groupId, address creator, uint256 stakingAmount, uint256 duration);
    event UserStaked(uint256 indexed groupId, address user);
    event UserUnstaked(uint256 indexed groupId, address user);
    event ProgressUpdated(uint256 indexed groupId, address user, uint256 progress);
    event YieldDistributed(uint256 indexed groupId, uint256 totalYield);
    event YieldClaimed(uint256 indexed groupId, address user, uint256 amount);

    constructor(address _usdc, address _aiAgent) {
        usdc = IERC20(_usdc);
        aiAgent = _aiAgent;
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

    function stake(uint256 _groupId) external nonReentrant {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isActive, "Group is not active");
        require(!group.isCompleted, "Group is completed");
        require(!group.users[msg.sender].hasStaked, "Already staked");
        require(group.memberCount < group.maxMembers, "Group is full");

        usdc.transferFrom(msg.sender, address(this), group.stakingAmount);
        
        group.users[msg.sender].hasStaked = true;
        group.totalStaked += group.stakingAmount;
        group.memberCount++;

        if (group.memberCount == group.maxMembers) {
            group.startTime = block.timestamp;
            // Here you would implement the logic to deposit to a yield protocol
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

    function completeGroupAndDistributeYield(uint256 _groupId, uint256 _totalYield) external onlyOwner {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isActive, "Group is not active");
        require(!group.isCompleted, "Group already completed");
        require(
            block.timestamp >= group.startTime + group.duration,
            "Learning period not finished"
        );

        group.isCompleted = true;
        group.totalYield = _totalYield;

        // Here you would implement the logic to withdraw from yield protocol
        
        emit YieldDistributed(_groupId, _totalYield);
    }

    function claimYieldAndUnstake(uint256 _groupId) external nonReentrant {
        LearningGroup storage group = learningGroups[_groupId];
        require(group.isCompleted, "Group not completed");
        require(group.users[msg.sender].hasStaked, "Not staked");
        require(!group.users[msg.sender].hasClaimedYield, "Already claimed");

        uint256 progress = group.users[msg.sender].progressPercentage;
        uint256 yieldShare = (group.totalYield * progress) / 100;

        group.users[msg.sender].hasClaimedYield = true;
        group.users[msg.sender].yieldAllocation = yieldShare;

        // Transfer initial stake + yield share
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