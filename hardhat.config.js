// For deploy
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");

// For test
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ganache");

// For environment
require('dotenv').config();

// const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SCAN_API_KEY = process.env.SCAN_API_KEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      timeout: 200000
    },
    development: {
      url: "http://127.0.0.1:8545",
      gas: 6000000,
      timeout: 200000
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [PRIVATE_KEY],
      chainId: 97,
      timeout: 20000
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      gasPrice: 2000000000,
      accounts: [PRIVATE_KEY]
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test/",
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: SCAN_API_KEY
  },
};
