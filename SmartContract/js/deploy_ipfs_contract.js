const {Web3} = require('web3');
const web3 = new Web3('http://127.0.0.1:8545'); // Connect to Ganache

// Compile your contract and get its ABI and bytecode
const {contractABI,contractBytecode} = require('./compile_contract');

// Create a contract object
const Contract = new web3.eth.Contract(contractABI);

// Deploy the contract
async function deployContract() {
    const accounts = await web3.eth.getAccounts();
    const deployTransaction = Contract.deploy({
        data: contractBytecode,
        arguments: [], // If your constructor requires arguments
    });

    const deployOptions = {
        from: accounts[0],
        gas: '4700000', // Adjust the gas limit as needed
    };

    const deployedContract = await deployTransaction.send(deployOptions);
    return deployedContract;
}

// Call the deployContract function
deployContract().then(async deployedContract => {
    console.log('Contract deployed at address:', deployedContract.options.address);
    const accounts = await web3.eth.getAccounts()
    // Call a contract function
    callContractFunction(deployedContract.options.address,accounts[0]);
});
async function callContractFunction(contractAddress,address) {
    const contractInstance = new web3.eth.Contract(contractABI, contractAddress);

    // Call a contract function
    const result = await contractInstance.methods.getIPFSHashes(address).call();

    console.log('Function Result:', result);
}
