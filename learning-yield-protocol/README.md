# Learning Yield Protocol

A smart contract protocol for incentivized learning through pooled yield. Users create learning groups, stake USDC, and earn yield based on their progress. The pooled USDC is deposited into Aave for yield generation.

## Overview

The protocol consists of:
- LearningYieldPool.sol: Main contract for managing learning groups and yield distribution
- Mock contracts for testing (MockERC20, MockAavePool, MockAToken)

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Access to Ethereum network (local or testnet)
- USDC token contract address
- Aave V3 Pool contract address
- Aave V3 aUSDC token address

## Installation

```bash
git clone <repository-url>
cd learning-yield-protocol
npm install
```

## Testing

Run the test suite:
```bash
npx hardhat test
```

Run with gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

## Deployment

1. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Edit .env with your values
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
USDC_ADDRESS=usdc_contract_address
AAVE_POOL_ADDRESS=aave_pool_address
AUSDC_ADDRESS=ausdc_token_address
AI_AGENT_ADDRESS=ai_agent_address
```

2. Configure the network in hardhat.config.ts:
```typescript
networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
}
```

3. Deploy the contract:
```bash
# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost

# Deploy to testnet (Goerli)
npx hardhat run scripts/deploy.ts --network goerli
```

## Contract Addresses

After deployment, the contract addresses will be:
- Goerli: `<to_be_filled_after_deployment>`
- Mumbai: `<to_be_filled_after_deployment>`

## Contract Verification

Verify the contract on Etherscan:
```bash
npx hardhat verify --network goerli DEPLOYED_CONTRACT_ADDRESS CONSTRUCTOR_ARG1 CONSTRUCTOR_ARG2 CONSTRUCTOR_ARG3 CONSTRUCTOR_ARG4
```

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
