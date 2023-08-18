const IPFS = artifacts.require("IPFSRegistry");

module.exports = (deployer) => {
    deployer.deploy(IPFS);
};