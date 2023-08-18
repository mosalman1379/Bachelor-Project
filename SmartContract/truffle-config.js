require("dotenv").config();
const {MNEMONIC, PROJECT_ID} = process.env;

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1", // Localhost (default: none)
            port: 8545, // Standard Ethereum port (default: none)
            network_id: "*", // Any network (default: none)
        },
        sepolia: {
            confirmations: 2,
            networkCheckTimeout: 50000,
            network_id: "11155111",
            provider: () => new HDWalletProvider({
                providerOrUrl: `https://sepolia.infura.io/v3/${PROJECT_ID}`,
                mnemonic: {
                    phrase: MNEMONIC
                }
            }),
            skipDryRun: true,
            timeoutBlocks: 4000,
        },
        api_keys: {
            etherscan: 'IPFFBGQ917QDUNYWAUIMPZMAV7SJWWXI6R'
        }
    },
    compilers: {
        solc: {
            version: "0.8.9",
        },
    },
};