# Robolingo
A fun **Yield-to-Learn** socialfi no-loss platform, where users incentivize learning through pooled yield, earning rewards with AI tutors and evaluators

## Table of Contents
- [Tech Stack](#tech-stack)
- [Walrus](#walrus)
- [Smart Contracts](#smart-contracts)
  - [Overview](#overview)
  - [Core Components](#core-components)
  - [Usage Flow](#usage-flow)
  - [Sample Transactions](#sample-transactions)
- [Considerations and TODOs](#considerations-and-todos)

## Tech Stack
- Walrus
- Hedera
- Eliza 

## Smart Contracts
The smart contract represents a socialfie (yield-to-learn) protocol that incentivizes learning through yield farming. Users join learning groups, stake USDC, and earn yield based on their learning progress.

[LearningYieldPool.sol](learning-yield-protocol/contracts/LearningYieldPool.sol)   
[HashScan Contract TX](https://hashscan.io/testnet/transaction/0xe4f229aad91afddb1eda5f8b83d0eaf5fe9e147af16adc777abd9dc45ab621cc)

### Overview

The protocol enables:
- Group-based learning with staking requirements
- Progress tracking and verification by AI
- Yield generation through Aave
- Proportional yield distribution based on progress

### Core Components

#### Learning Group Structure
```solidity
struct LearningGroup {
    address creator;
    uint256 stakingAmount;  // Required USDC to join
    uint256 totalStaked;
    uint256 startTime;
    uint256 duration;
    uint256 totalYield;
    bool isActive;
    bool isCompleted;
    mapping(address => UserInfo) users;
    address[] members;  // Track group members
    uint256 memberCount;
    uint256 maxMembers;
}
```

#### User Information
```solidity
struct UserInfo {
    bool hasStaked;
    uint256 progressPercentage;
    bool hasClaimedYield;
    uint256 yieldAllocation;
}
```

### Key Functions

#### Group Management
- `createLearningGroup(uint256 stakingAmount, uint256 duration, uint256 maxMembers)`
  - Creates new learning group
  - Sets staking requirements and duration

#### User Operations
- `stake(uint256 groupId)`
  - Join group by staking USDC
  - Requires approval of USDC transfer

#### Progress & Yield
- `updateProgress(uint256 groupId, address user, uint256 progress)`
  - AI agent updates user progress (0-100%)
  - Only callable by authorized AI agent

- `completeGroupAndDistributeYield(uint256 groupId)`
  - Ends group learning period
  - Calculates yield distribution based on progress

- `claimYieldAndUnstake(uint256 groupId)`
  - Users claim their yield share
  - Withdraw initial stake plus earned yield

### Integrations

#### External Protocols
- **USDC**: Staking token
- **Aave V3**: Yield generation
- **AI Agent**: Progress verification

#### Security Features
- OpenZeppelin's Ownable for access control
- ReentrancyGuard for transaction safety
- Progress validation (0-100%)
- Group state management

### Events
- GroupCreated
- UserStaked
- ProgressUpdated
- YieldDistributed
- YieldClaimed

### Usage Flow

1. Admin creates learning group with parameters
2. Users stake USDC to join group
3. AI agent tracks and updates progress
4. Upon completion, yield is distributed
5. Users claim yield proportional to progress

## Sample Transactions
```


🟣 Connecting to deployed contract...

Stake function signature: FunctionFragment {
  type: 'function',
  inputs: [
    ParamType {
      name: '_groupId',
      type: 'uint256',
      baseType: 'uint256',
      indexed: undefined,
      components: null,
      arrayLength: null,
      arrayChildren: null
    }
  ],
  name: 'stake',
  constant: false,
  outputs: [],
  stateMutability: 'nonpayable',
  payable: false,
  gas: null
}

🟣 Creating a learning group...




Group created! Transaction: 0x5eaee6aa52511258136ddbd9274e307030ef65fc7f9419a562057859ab14ca3f

Group ID: 1

Group Info:
Creator: 0xE830C5cC74f591005AF24DEFafa6AE1f7Ffb47a9
Staking Amount: 0.1 USDC
Duration: 24 hours
Max Members: 3n n

🟣 Approving USDC spend...
USDC Address: 0x0000000000000000000000000000000000001549

🟣 Checking token association...
Token associated successfully!

Initial USDC Balance: 1.0 USDC
Approval transaction sent: 0x2124f2431de1c6f150d90161027c763cd9f3970ed7f71ef8d85fcd15a402594f
USDC approved! Transaction: 0x2124f2431de1c6f150d90161027c763cd9f3970ed7f71ef8d85fcd15a402594f

Contract USDC Balance: 0.0 USDC

🟣 Staking in group...
Current allowance: 0.1 USDC
Current USDC Balance: 1.0 USDC
Attempting to stake...
Staking in group: 1

Debug contract info:
Contract address: 0xEeBcBd2641DA50D9Ab8a6bC7e3f2Fff191f48e10

Staked successfully! Transaction: 0x26ee21ad0a058b9e35b1b4d204df45a969f7db0956ee5436d97761461c96cb31

Debug Events:
DebugStakeEntry: Result(3) [ 1n, '0xE830C5cC74f591005AF24DEFafa6AE1f7Ffb47a9', 100000n ]
DebugStakeCheck: Result(5) [ true, true, false, 0n, 3n ]
DebugStakeTransfer: Result(3) [ true, 100000n, 1000000n ]
UserStaked: Result(2) [ 1n, '0xE830C5cC74f591005AF24DEFafa6AE1f7Ffb47a9' ]

🟣 Updating progress...
Progress updated! Transaction: 0x84ac18b0137acd599d0dec55ea2506489d05e2e9c6d568ef201c67bead987bc5

User Info:
Has Staked: true
Progress: 75n %
Has Claimed Yield: false
Yield Allocation: 0.0 USDC

✅ All tests completed successfully!
```

## Considerations and TODOs

- Only AI agent can update progress
- Reentrancy protection on financial operations
- Group state validation
- Progress bounds checking (0-100%)