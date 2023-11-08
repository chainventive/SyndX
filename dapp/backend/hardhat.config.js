require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const INFURA_API_KEY = process.env.INFURA_API_KEY || '';
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity: "0.8.19",

  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    etherscan: {
      apiKey: `${ETHERSCAN_API_KEY}`,
    },
  }
};
