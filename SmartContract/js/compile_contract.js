const solc = require('solc');
const fs = require('fs');
const path = require('path');
// Read the Solidity source code
// Todo fix IPFS.sol path
const smart_contract_path = path.dirname(__dirname)
const contract_path = path.join(smart_contract_path,'/contracts/IPFS.sol')
const contractSource = fs.readFileSync(contract_path, 'utf8');

// Compile the contract
const input = {
    language: 'Solidity',
    sources: {
        'IPFSRegistry.sol': {
            content: contractSource,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contractABI = output.contracts['IPFSRegistry.sol']['IPFSRegistry'].abi;
const contractBytecode = output.contracts['IPFSRegistry.sol']['IPFSRegistry'].evm.bytecode.object;
module.exports.contractABI = contractABI
module.exports.contractBytecode = contractBytecode