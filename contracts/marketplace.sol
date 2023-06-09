// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";
import "./NFT.sol";

contract marketplace {
    uint orderID;
    address marketplace; //marketplace EA
    mapping(address => bool) RegisteredTransporters;
    mapping(address => bool) RegisteredSellers;
    mapping(address => Order) TransporterOrders; //each transporter is associated with one purchase order or a false... order ID is above 0 .. 0 means availble , other numbers mean busy
    mapping(address => bool) TransporterAvailable; //false busy with delivery, true available
    mapping(uint => bool) ItemIdInPurchase; //to check if the token ID is associated with any purchase
    mapping(address => bool) RegisteredBuyers;
    mapping(address => address) sellerContracts; //address of each seller is mapped to address of SC
    enum orderState {
        created,
        AllCollateralPaid,
        ArrivedAtSeller,
        SellerProvidedHash,
        DeliveredKeyAndItem,
        SuccessfulHashVerification,
        PaymentSettledSuccess,
        DisputeVerificationFailure,
        EtherWithArbitrator
    }

    struct Order {
        uint orderID; //any number above 0 .. unique per order
        uint tokenID; //NFT token to be purchased
        uint parentTokenID; //NFT parent token ID if NFT is part of a composite NFT
        bytes32 parentJsonHash; //hash of the Json object of the NFT with the parent
        string tokenIDs; //all the token IDs that exist in the current parent NFT
        address seller;
        address buyer;
        address transporter;
        uint price;
        orderState state;
        bool sellerCollateral;
        bool transporterCollateral;
        bool buyerCollateral;
        bytes32 hash;
        uint collateral;
    }
    //event
    event NewChildSellerContractAddedSuccessfully(
        address seller,
        address sellerContract
    );
    event createPurchaseOrderRequest(
        uint tokenId,
        address seller,
        address buyer
    );
    event PORCreated(
        uint tokenID,
        uint parentTokenID,
        uint orderID,
        address transporter
    );
    event AllCollateralDeposited(orderState state);
    event CollateralDepositedByUser(address user);
    event TransporterConfirmsArrivalAtSeller(uint orderID, address seller);
    event SellerConfirmsTransporterLeftWithKey(uint orderID, bytes32 hash);
    event TransporterArrivedAtBuyer(uint orderID, uint tokenID);
    event SuccessfulHashVerification(uint orderID);
    event SuccessfulPaymentSettlement(uint order);
    event NFTransferredToNewOwner(
        address from,
        address to,
        uint PreviousParentTokenId,
        uint SoldtokenId,
        uint NewParenttokenId,
        string newParentCompositeTokenIDs,
        bytes32 newParentJsonHash
    );

    constructor() public {
        marketplace = msg.sender;
        orderID = 0; //counter
    }

    modifier onlyMarketplace() {
        require(msg.sender == marketplace);
        _;
    }

    ///////////////////
    ///Registration////
    ///////////////////

    //Sellers
    function RegisterSeller(address a) public onlyMarketplace {
        RegisteredSellers[a] = true;
    }

    function RevokeSeller(address a) public onlyMarketplace {
        RegisteredSellers[a] = false;
    }

    function RegisteredSeller(address a) public {
        require(RegisteredSellers[a]);
    }

    //Buyers
    function RegisterBuyer(address a) public onlyMarketplace {
        RegisteredBuyers[a] = true;
    }

    function RevokeBuyer(address a) public onlyMarketplace {
        RegisteredBuyers[a] = false;
    }

    function RegisteredBuyer(address a) public {
        require(RegisteredBuyers[a]);
    }

    //transporter
    //Buyers
    function RegisterTransporter(address a) public onlyMarketplace {
        RegisteredTransporters[a] = true;
        TransporterAvailable[a] = true; //newly registered therefore available
    }

    function RevokeTransporter(address a) public onlyMarketplace {
        RegisteredTransporters[a] = false;
    }

    function RegisteredTransporter(address a) public {
        require(RegisteredTransporters[a]);
    }

    function addChildren(
        address seller,
        address sellerContract
    ) public onlyMarketplace {
        RegisteredSeller(seller); //seller must be registered
        sellerContracts[seller] = sellerContract;
        emit NewChildSellerContractAddedSuccessfully(seller, sellerContract);
    }

    //a buyer calls the BuyItem function
    function BuyItem(uint tokenId, address seller) public {
        //buyer can cancel the order at this point with no problems
        RegisteredBuyer(msg.sender); //check if the caller is registered as a buyer
        require(
            ItemIdInPurchase[tokenId] == false,
            "ItemID already is in purchase"
        );
        emit createPurchaseOrderRequest(tokenId, seller, msg.sender);
    }

    //every purchase order is associated with a transporter
    function CreatePurchaseRequest(
        uint tokenID,
        uint parentTokenID,
        bytes32 parentJsonHash,
        string memory tokenIDs,
        address seller,
        address buyer,
        uint price,
        address transporter,
        uint collateral
    ) public onlyMarketplace {
        require(
            ItemIdInPurchase[tokenID] == false,
            "ItemID already is in purchase"
        );
        ItemIdInPurchase[tokenID] = true; //so no one else can request to buy it
        orderID = orderID + 1;
        Order memory POR = Order(
            orderID,
            tokenID,
            parentTokenID,
            parentJsonHash,
            tokenIDs,
            seller,
            buyer,
            transporter,
            price,
            orderState.created,
            false,
            false,
            false,
            0x000,
            collateral
        );
        require(
            TransporterAvailable[transporter] == true,
            "Please change the transporter, transporter is busy"
        );
        TransporterAvailable[transporter] = false;
        TransporterOrders[transporter] = POR; //A trsansporter is now associated with the order
        emit PORCreated(tokenID, parentTokenID, orderID, transporter);
    }

    function DepositCollateral(address transporter) public payable {
        uint collateral = TransporterOrders[transporter].collateral;
        require(
            msg.value == collateral * 1 ether &&
                (TransporterOrders[transporter].state == orderState.created)
        );
        bool inside = false;
        if (
            RegisteredSellers[msg.sender] == true &&
            (TransporterOrders[transporter].seller == msg.sender &&
                TransporterOrders[transporter].sellerCollateral == false)
        ) //seller
        {
            TransporterOrders[transporter].sellerCollateral = true;
            inside = true;
            emit CollateralDepositedByUser(msg.sender);
        } else if (
            RegisteredBuyers[msg.sender] == true &&
            (TransporterOrders[transporter].buyer == msg.sender &&
                TransporterOrders[transporter].buyerCollateral == false)
        ) //buyer
        {
            TransporterOrders[transporter].buyerCollateral = true;
            inside = true;
            emit CollateralDepositedByUser(msg.sender);
        } else if (
            RegisteredTransporters[msg.sender] == true &&
            (TransporterOrders[transporter].transporter == msg.sender) &&
            (TransporterOrders[transporter].transporterCollateral == false)
        ) //transporter
        {
            TransporterOrders[transporter].transporterCollateral = true;
            inside = true;
            emit CollateralDepositedByUser(msg.sender);
        }
        require(
            inside == true,
            "Error. No association with POR! You cannnot pay the collateral"
        );
        if (
            TransporterOrders[transporter].transporterCollateral &&
            TransporterOrders[transporter].sellerCollateral &&
            TransporterOrders[transporter].buyerCollateral
        ) {
            TransporterOrders[transporter].state = orderState.AllCollateralPaid;
            emit AllCollateralDeposited(TransporterOrders[transporter].state);
        }
    }

    function ArrivedAtSeller(address seller) public {
        RegisteredTransporter(msg.sender); //must be a registered transporter
        require(
            TransporterOrders[msg.sender].state == orderState.AllCollateralPaid
        );
        require(
            msg.sender == TransporterOrders[msg.sender].transporter &&
                (seller == TransporterOrders[msg.sender].seller)
        );
        TransporterOrders[msg.sender].state = orderState.ArrivedAtSeller; //update state
        emit TransporterConfirmsArrivalAtSeller(
            TransporterOrders[msg.sender].orderID,
            seller
        );
    }

    //fix the hash to be entered as parameter
    //transporter picks up the key and the item from the seller, the seller confirms it and updates the hash in the SC
    function TransporterOnTheWay(address transporter, bytes32 hash) public {
        RegisteredSeller(msg.sender); //must be a registered seller
        require(msg.sender == TransporterOrders[transporter].seller);
        require(
            TransporterOrders[transporter].state == orderState.ArrivedAtSeller
        );
        //the below is the hash of the key abi.encoded "thisiskey1,thisiskey2" which the seller gives in person to the transporter
        //ABI.Encoded 0x685e9322000000000000000000000000ab8483f64d9c6d1ecf9b849ae677dd3315835cb2000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000a7468697369736b65793100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a7468697369736b65793200000000000000000000000000000000000000000000
        //HASH: 0xb13f9c3e10b825f5f250d7d32cffb236a0a21b6378599438e74907c26028d9dd
        TransporterOrders[transporter].hash = hash;
        TransporterOrders[transporter].state = orderState.SellerProvidedHash;
        emit SellerConfirmsTransporterLeftWithKey(
            TransporterOrders[transporter].orderID,
            TransporterOrders[transporter].hash
        );
    }

    event testHash(bytes32 hash);

    function TEST(string memory keyT, string memory keyB) public {
        emit testHash(keccak256(abi.encodePacked(keyT, keyB)));
    }

    function TransporterAtBuyer(
        address buyer,
        string memory keyT,
        string memory keyB
    ) public {
        RegisteredTransporter(msg.sender); //must be a registered transporter
        require(
            TransporterOrders[msg.sender].state == orderState.SellerProvidedHash
        );
        require(msg.sender == TransporterOrders[msg.sender].transporter);
        require(buyer == TransporterOrders[msg.sender].buyer);
        require(
            TransporterOrders[msg.sender].hash ==
                keccak256(abi.encodePacked(keyT, keyB)),
            "Dispute! Entered Keys by transporter do not match Hash!"
        );
        TransporterOrders[msg.sender].state = orderState.DeliveredKeyAndItem;
        emit TransporterArrivedAtBuyer(
            TransporterOrders[msg.sender].orderID,
            TransporterOrders[msg.sender].tokenID
        );
    }

    function BuyerHashVerification(
        address transporter,
        string memory keyT,
        string memory keyB,
        uint256 newParentTokenID,
        string memory newParentTokenIDs,
        bytes32 newParentJsonHash
    ) public payable {
        RegisteredBuyer(msg.sender);
        require(msg.sender == TransporterOrders[transporter].buyer);
        require(transporter == TransporterOrders[transporter].transporter); //buyer and trasnporter of this order
        require(
            TransporterOrders[transporter].state ==
                orderState.DeliveredKeyAndItem
        );
        require(
            TransporterOrders[transporter].hash ==
                keccak256(abi.encodePacked(keyT, keyB)),
            "Dispute! Entered Keys by buyer do not match hash"
        ); //hash verification
        TransporterOrders[transporter].state = orderState
            .SuccessfulHashVerification;
        emit SuccessfulHashVerification(TransporterOrders[transporter].orderID);
        BuyNFT(
            TransporterOrders[transporter],
            newParentTokenID,
            newParentTokenIDs,
            newParentJsonHash,
            TransporterOrders[transporter].price,
            TransporterOrders[transporter].collateral
        );
        //BuyNFT(TransporterOrders[transporter].seller, transporter, TransporterOrders[transporter].tokenID, TransporterOrders[transporter].parentTokenID, newParentTokenID, newParentTokenIDs, newParentJsonHash, TransporterOrders[transporter].price, TransporterOrders[transporter].collateral);
    }

    //address seller, address transporter, uint256 SoldtokenId, uint256 PreviousParentTokenId,
    function BuyNFT(
        Order memory TransporterOrders,
        uint256 NewParenttokenId,
        string memory newParentTokenIDs,
        bytes32 newParentJsonHash,
        uint256 price,
        uint collateral
    ) public payable {
        assert(msg.value == (price * 1 ether));
        address sellerContract = sellerContracts[TransporterOrders.seller];
        //nf.setApprovalForAll(sellerContract, true);
        payable(TransporterOrders.seller).transfer(
            msg.value + (collateral * 1 ether)
        ); //seller
        payable(msg.sender).transfer(collateral * 1 ether); //buyer
        payable(TransporterOrders.transporter).transfer(collateral * 1 ether); //transporter
        emit SuccessfulPaymentSettlement(TransporterOrders.orderID);
        NFT(sellerContract).TransferNFTOwnership(
            TransporterOrders.tokenID,
            msg.sender
        );
        //NFT(sellerContract).transferFrom(seller, msg.sender, tokenId);
        TransporterOrders.state = orderState.PaymentSettledSuccess;
        TransporterAvailable[TransporterOrders.transporter] = true;
        ItemIdInPurchase[TransporterOrders.tokenID] = false;
        emit NFTransferredToNewOwner(
            TransporterOrders.seller,
            msg.sender,
            TransporterOrders.parentTokenID,
            TransporterOrders.tokenID,
            NewParenttokenId,
            newParentTokenIDs,
            newParentJsonHash
        );
    }
}
