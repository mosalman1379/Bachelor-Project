const {contractABI, contractBytecode} = require('./compile_token_contract');
const {ethers} = require('ethers');
const infura_url = "https://sepolia.infura.io/v3/6c05bf4a314642f09df40c86d1a424cb";
const private_key = "0xe4dce4eecd5de5050de7b0b31bac706015bae9278996057524355663ce38e192";
const deployed_contract_address = "0xf619ecbD0305285353B60fc27fb3458f1B95d39A";
const deploy = async function () {
    try {
        const total_supply = 1000000000000000;
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const ContractInstance = new ethers.ContractFactory(contractABI, contractBytecode, Wallet);
        const contractInstance = await ContractInstance.deploy("RIAL IRAN", "RIAL", total_supply);
        await contractInstance.deployed();
        console.log("Deployed contract address - ", contractInstance.address);
    } catch (err) {
        console.log("Error in deploying contract.");
        console.log(err);
    }
};
async function mintToken(address, amount) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        await contract.sendTokens(address, amount);
        console.log('minting Transaction Done');
    } catch (e) {
        console.log("Error is: ", e);
    }
}

async function clearBalance(account) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        const account_balance = await get_balance(account);
        await contract.decreaseBalance(account, account_balance);
        console.log('burning Transaction Done');
    } catch (e) {
        console.log("Error is: ", e);
    }
}
async function transferFromTo(from, to, amount) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        await contract.transferFromDifferentAccounts(from, to, amount, {
            gasLimit: 100000
        });
        console.log('transfer transition done');
    } catch (e) {
        console.log("Error is: ", e);
    }
}

async function transferFromSenderTo(to, amount) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        await contract.sendTokens(to, amount, {
            gasLimit: 100000
        });
        console.log('transfer transition from msg.sender done');
    } catch (e) {
        console.log("Error is: ", e);
    }
}

async function get_balance(from) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        const {_hex} = await contract.balanceOf(from);
        return parseInt(_hex, 16);
    } catch (e) {
        console.log("Error is: ", e);
    }
}

module.exports.Get_Balance = get_balance;
module.exports.TransferFromTo = transferFromTo;
module.exports.MintingToken = mintToken;