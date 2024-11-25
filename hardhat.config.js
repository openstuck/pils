require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
const { forkNetwork } = require("./config");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "rbaMainnet",
  networks: {
    hardhat: {
      // forking: {
      //   url: process.env.BSC_URL || "",
      // },
    },
    mainnet: {
      url: forkNetwork.eth || "",
      accounts:
        process.env.PRIVATE_KEY_BSC !== undefined ? [process.env.PRIVATE_KEY_BSC] : [],
      allowUnlimitedContractSize: true,
    },
    rbaMainnet: {
      url: forkNetwork.mainnet || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      allowUnlimitedContractSize: true,
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rbaMainnet: 'abcs',
    },
    customChains: [
      {
        network: "testnet",
        chainId: 159,
        urls: {
          apiURL: "https://testnet.rbascan.com/api",
          browserURL: "https://testnet.rbascan.com/",
        },
      },
      {
        network: "rbaMainnet",
        chainId: 158,
        urls: {
          apiURL: "https://rbascan.com/api",
          browserURL: "https://rbascan.com/",
        },
      },
    ],
  },
};
