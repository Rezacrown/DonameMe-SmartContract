import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// load .env
dotenv.config();

// load account metamask for using to deploy contract
const ACCOUNT = process.env.ACCOUNT_METAMASK_PRIVATE_KEY as string;

// check
if (!ACCOUNT) throw new Error("Missing Metamask private key in .env");

// console.log(`account ada : ${ACCOUNT}`);

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia_lisk: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [ACCOUNT || ""],
      chainId: 4202,
    },
  },
};

export default config;
