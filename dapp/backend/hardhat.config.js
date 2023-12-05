require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

// Load etherscan api key from dotenv
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Load alchemy networks API key from dotenv
const ALCHEMY_SEPOLIA_API_KEY = process.env.ALCHEMY_SEPOLIA_API_KEY;
const ALCHEMY_MUMBAI_API_KEY = process.env.ALCHEMY_MUMBAI_API_KEY;

// Load testing accounts private keys from dotenv
const PRIVATE_KEY_ADMIN   = process.env.PRIVATE_KEY_ADMIN;
const PRIVATE_KEY_SYNDIC  = process.env.PRIVATE_KEY_SYNDIC;
const PRIVATE_KEY_ANIGAIL = process.env.PRIVATE_KEY_ANIGAIL;
const PRIVATE_KEY_BERNARD = process.env.PRIVATE_KEY_BERNARD;
const PRIVATE_KEY_CYNTHIA = process.env.PRIVATE_KEY_CYNTHIA;
const PRIVATE_KEY_ELYES   = process.env.PRIVATE_KEY_ELYES;
const PRIVATE_KEY_DOUNIA  = process.env.PRIVATE_KEY_DOUNIA;

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
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`,
      accounts: [ 
        PRIVATE_KEY_ADMIN,
        PRIVATE_KEY_SYNDIC,
        PRIVATE_KEY_ANIGAIL,
        PRIVATE_KEY_BERNARD,
        PRIVATE_KEY_CYNTHIA,
        PRIVATE_KEY_ELYES,
        PRIVATE_KEY_DOUNIA,
      ]
    },
    /*
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_MUMBAI_API_KEY}`,
      accounts: [
        PRIVATE_KEY_ADMIN,
        PRIVATE_KEY_SYNDIC,
        PRIVATE_KEY_ANIGAIL,
        PRIVATE_KEY_BERNARD,
        PRIVATE_KEY_CYNTHIA,
        PRIVATE_KEY_ELYES,
        PRIVATE_KEY_DOUNIA,
      ],           
    }
    */
  },

  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  }
};
