require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity: {
    version: "0.8.20",
    settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
  },

  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ ALCHEMY_API_KEY }`,
      accounts: [ SEPOLIA_PRIVATE_KEY ]
    },
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  }
};
