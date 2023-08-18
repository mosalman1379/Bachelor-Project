const RialToken = artifacts.require("IPFSRegistry");

function deployFunc(deployer) {
    deployer.deploy(RialToken)
}

module.exports.deploy = deployFunc