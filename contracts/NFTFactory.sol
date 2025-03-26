// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./NFTCollection.sol";

/**
 * @title NFTFactory
 * @dev Factory contract to create new NFT collections
 */
contract NFTFactory {
    // Mapping from creator address to their collection addresses
    mapping(address => address[]) private _collections;
    
    // Event emitted when a new NFT collection is created
    event NFTCollectionCreated(
        address indexed creator,
        address indexed nftCollection,
        string name,
        string symbol
    );
    
    /**
     * @dev Create a new NFT collection
     * @param name Collection name
     * @param symbol Collection symbol
     * @param baseURI Base URI for token metadata
     * @param royaltyFee Royalty fee in basis points (100 = 1%)
     * @return Address of the newly created collection
     */
    function createNFTCollection(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint96 royaltyFee
    ) public returns (address) {
        // Create a new NFT collection contract
        NFTCollection newCollection = new NFTCollection(
            name,
            symbol,
            baseURI,
            royaltyFee,
            msg.sender
        );
        
        // Store the collection address for the creator
        _collections[msg.sender].push(address(newCollection));
        
        // Emit creation event
        emit NFTCollectionCreated(
            msg.sender,
            address(newCollection),
            name,
            symbol
        );
        
        return address(newCollection);
    }
    
    /**
     * @dev Get all collections created by a specific address
     * @param creator Address of the creator
     * @return Array of collection addresses
     */
    function getCollectionsByCreator(address creator) 
        public 
        view 
        returns (address[] memory) 
    {
        return _collections[creator];
    }
} 