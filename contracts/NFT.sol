// contracts/NFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

//every seller will have a contract
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;
    address sellerOwner;

    //modifers
    //modifier costs(){
    //     assert(msg.value == (price * 1 ether));//must be in ether
    //   _;
    //}

    constructor(address marketplaceAddress) ERC721("Metaverse Tokens", "METT") {
        contractAddress = marketplaceAddress;
        sellerOwner = msg.sender;
    }

    event NFTSuccessfullyCreated(
        address _to,
        uint256 _tokenId,
        string _uri,
        bytes32 hash,
        uint256 price,
        uint256 parentTokenID,
        string tokens
    );

    modifier onlymarketplace() {
        require(msg.sender == contractAddress);
        _;
    }

    modifier onlySeller() {
        require(msg.sender == sellerOwner);
        _;
    }

    ////0x0000000000000000000000000000000000000000000000000000006d6168616d
    function createToken(
        string memory tokenURI,
        bytes32 tokenHash,
        uint parentTokenID,
        uint256 tokenPrice,
        string memory tokens
    ) public onlySeller {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _setTokenHash(newItemId, tokenHash); //hash of parent NFT
        _setCompositeTokenIDs(newItemId, tokens);
        _setTokenPrice(newItemId, tokenPrice);
        _setParentNFTID(newItemId, parentTokenID);
        setApprovalForAll(contractAddress, true);
        emit NFTSuccessfullyCreated(
            msg.sender,
            newItemId,
            tokenURI,
            tokenHash,
            tokenPrice,
            parentTokenID,
            tokens
        );
    }

    //only registered buyers
    function TransferNFTOwnership(uint tokenId, address buyer) public {
        transferFrom(sellerOwner, buyer, tokenId); //transferring ownership
    }
}
