import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hedera_testnet: {
      url: process.env.RPC_URL || "http://localhost:7546",
      accounts: process.env.OPERATOR_ACCOUNT_PRIVATE_KEY ? 
        [process.env.OPERATOR_ACCOUNT_PRIVATE_KEY] : [],
      chainId: 296 // Hedera Testnet chainId
    }
  }
};

export default config; 