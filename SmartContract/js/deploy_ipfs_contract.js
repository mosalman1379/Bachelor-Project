const {contractABI, contractBytecode} = require('./compile_contract');
const {ethers} = require('ethers');
require('dotenv').config()
const infura_url = "https://sepolia.infura.io/v3/6c05bf4a314642f09df40c86d1a424cb";
const private_key = "0xe4dce4eecd5de5050de7b0b31bac706015bae9278996057524355663ce38e192";
const deployed_contract_address = "0xd1ca08B3710eD5Bde2f30cCbaD49150c7A0A929e";
const deploy = async function () {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const ContractInstance = new ethers.ContractFactory(contractABI, contractBytecode, Wallet);
        const contractInstance = await ContractInstance.deploy();
        await contractInstance.deployed();
        console.log("Deployed contract address - ", contractInstance.address);
    } catch (err) {
        console.log("Error in deploying contract.");
        console.log(err);
    }
};
async function add_ipfs(data) {
    try {
        const {image_path, description, nft_price, nft_type, hash, address} = data;
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        await contract.add_IPFS_Hash(image_path, description, nft_price, nft_type, hash, address);
        console.log('NFT added to smart-contract')
    } catch (err) {
        console.log("Error in add nft metadata to contract.");
        console.log(err);
    }
}
async function get_ipfs(address) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        const nft_metadata = await contract.get_IPFS_Hashes(address);
        console.log('NFT collected from smart-contract')
        return nft_metadata;
    } catch (err) {
        console.log("Error in collect nft metadata from contract.");
        console.log(err);
    }
}
module.exports.add_ipfs = add_ipfs;
module.exports.get_ipfs = get_ipfs;
module.exports.deploy_contract = deploy;