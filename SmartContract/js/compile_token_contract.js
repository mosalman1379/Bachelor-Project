const fs = require('fs');
const path = require("path");
const smart_contract_path = path.dirname(__dirname)
const contract_path_json = path.join(smart_contract_path,'/build/contracts/ERC20Token.json')
const file = fs.readFileSync(contract_path_json,{encoding:'utf-8'});
const contract_json = JSON.parse(file);
module.exports.contractABI = contract_json.abi;
module.exports.contractBytecode = contract_json.bytecode;