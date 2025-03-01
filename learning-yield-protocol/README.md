# Learning Yield Protocol

A smart contract protocol for incentivized learning through pooled yield. Users create learning groups, stake USDC, and earn yield based on their progress. The pooled USDC is deposited into Aave for yield generation.

## Overview

The protocol consists of:
- LearningYieldPool.sol: Main contract for managing learning groups and yield distribution
- Mock contracts for testing (MockERC20, MockAavePool, MockAToken)

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Docker (for Hedera deployment)
- Access to either:
  - Ethereum network (local or Goerli testnet)
  - Hedera network (testnet)
- For Hedera deployment:
  - Hedera testnet account (from [portal.hedera.com](https://portal.hedera.com))
  - JSON-RPC Relay running

## Installation

```bash
git clone https://github.com/OpenDive/robolingo.git
cd learning-yield-protocol
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your `.env` file:
- For Ethereum deployment:
  ```
  PRIVATE_KEY=your_ethereum_private_key
  INFURA_API_KEY=your_infura_key
  ETHERSCAN_API_KEY=your_etherscan_key
  ```
- For Hedera deployment:
  ```
  OPERATOR_ACCOUNT_ID=your_hedera_account_id
  OPERATOR_ACCOUNT_PRIVATE_KEY=your_hedera_private_key
  RPC_URL=http://localhost:7546
  ```
- Contract configuration (required for both):
  ```
  USDC_ADDRESS=usdc_contract_address
  AAVE_POOL_ADDRESS=aave_pool_address
  AUSDC_ADDRESS=ausdc_token_address
  AI_AGENT_ADDRESS=ai_agent_address
  ```

## Testing

Run the test suite:
```bash
npm test
# or
npx hardhat test
```

Run with gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

## Deployment

### Ethereum Deployment

1. Deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

2. Deploy to Goerli testnet:
```bash
npx hardhat run scripts/deploy.ts --network goerli
```

### Hedera Deployment

1. Start the JSON-RPC relay:
```bash
# Make sure Docker is running
./util/04-rpcrelay-run.sh
```

2. Deploy to Hedera testnet:
```bash
npx hardhat run scripts/deploy.ts --network hedera_testnet
```

## Contract Verification

### Ethereum
```bash
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS CONSTRUCTOR_ARG1 CONSTRUCTOR_ARG2 CONSTRUCTOR_ARG3 CONSTRUCTOR_ARG4
```

### Hedera
Contract verification on Hedera is handled automatically during deployment.

## Usage

1. Create a learning group:
```typescript
await learningPool.createLearningGroup(
  stakingAmount,  // Amount in USDC (with 6 decimals)
  duration,       // Duration in seconds
  maxMembers     // Maximum number of members
);
```

2. Users stake USDC:
```typescript
// Approve USDC spending
await usdc.approve(learningPoolAddress, stakingAmount);
// Stake in group
await learningPool.stake(groupId);
```

3. AI agent updates progress:
```typescript
await learningPool.connect(aiAgent).updateProgress(groupId, userAddress, progressPercentage);
```

4. Complete group and distribute yield:
```typescript
await learningPool.completeGroupAndDistributeYield(groupId);
```

5. Users claim yield:
```typescript
await learningPool.claimYieldAndUnstake(groupId);
```

## License

MIT
