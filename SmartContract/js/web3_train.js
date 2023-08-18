const {contractABI, contractBytecode} = require('./compile_contract');
const {ethers} = require('ethers');
const infura_url = process.env.INFURA_URL;
const private_key = process.env.private_key;
const deployed_contract_address = process.env.deployed_ipfs_contract_address;
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
        const {image_path, description, nft_price, nft_type, hash,address} = data;
        const provider = new ethers.providers.JsonRpcProvider(infura_url);
        const Wallet = new ethers.Wallet(private_key, provider);
        const contract = new ethers.Contract(deployed_contract_address, contractABI, Wallet);
        await contract.add_IPFS_Hash(image_path, description, nft_price, nft_type, hash,address);
        console.log('NFT added to smart-contract')
    } catch (err) {
        console.log("Error in add nft metadata to contract.");
        console.log(err);
    }
}
async function get_ipfs(address){
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