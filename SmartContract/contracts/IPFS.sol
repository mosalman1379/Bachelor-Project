// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract IPFSRegistry {
    struct IPFS_Struct{
        string image_path;
        string description;
        uint256 nft_price;
        string nft_type;
        string hash;
    }
    struct UserNFTS{
        IPFS_Struct[] IPFS_Hashes;
    }
    mapping(address => UserNFTS) private userIPFSData;

    function add_IPFS_Hash(string memory image_path,string memory description,uint256 nft_price,
        string memory nft_type,string memory hash,address user_address) external {
        IPFS_Struct memory ipfs = IPFS_Struct(image_path,description,nft_price,nft_type,hash);
        userIPFSData[user_address].IPFS_Hashes.push(ipfs);
    }

    function get_IPFS_Hashes(address _user) external view returns (IPFS_Struct[] memory) {
        return userIPFSData[_user].IPFS_Hashes;
    }
}