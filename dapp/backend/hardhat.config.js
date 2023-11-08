require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

// Go to https://infura.io, sign up, create a new API key
// in its dashboard, and replace "KEY" with it
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';

// Replace this private key with your Sepolia account private key
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

  solidity: "0.8.19",

  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  }
};
