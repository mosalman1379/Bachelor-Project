const {Web3} = require("web3");

// Loading the contract ABI and Bytecode
// (the results of a previous compilation step)
const fs = require("fs");
const {contractABI, contractBytecode} = require('./compile_contract.js');;

async function main() {
    // Configuring the connection to an Ethereum node
    const network = "sepolia";
    const web3 = new Web3(`https://eth-sepolia.g.alchemy.com/v2/JYOPEntDQ_6Y_AiHxKxYRwoOtNJ1xjLm`);
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(
        '0xe4dce4eecd5de5050de7b0b31bac706015bae9278996057524355663ce38e192',
    );
    web3.eth.accounts.wallet.add(signer);

    // Using the signing account to deploy the contract
    const contract = new web3.eth.Contract(contractABI);
    contract.options.data = contractBytecode;
    const deployTx = contract.deploy({data:contractBytecode,arguments:[]});
    const deployedContract = await deployTx
        .send({
            from: signer.address,
            gas: await deployTx.estimateGas(),
        })
        .once("transactionHash", (txhash) => {
            console.log(`Mining deployment transaction ...`);
            console.log(`https://${network}.etherscan.io/tx/${txhash}`);
        });
    // The contract is now deployed on chain!
    console.log(`Contract deployed at ${deployedContract.options.address}`);
    console.log(
        `Add DEMO_CONTRACT to the.env file to store the contract address: ${deployedContract.options.address}`,
    );
}

require("dotenv").config();
main();