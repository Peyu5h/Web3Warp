// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    address public creator;
    
    mapping(address => uint256[]) private _ownedTokens;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint96 royaltyFee,
        address creator_
    ) ERC721(name, symbol) Ownable(creator_) {
        _baseTokenURI = baseURI;
        _setDefaultRoyalty(creator_, royaltyFee);
        
        creator = creator_;
    }

    function mintNFT(address to, string memory tokenURI) 
        public 
        onlyOwner 
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        _ownedTokens[to].push(tokenId);
        
        return tokenId;
    }
    
    //get all tokens of an owner
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }
    
    //gets tokens of message sender
    function tokensOfOwner() public view returns (uint256[] memory) {
        return _ownedTokens[msg.sender];
    }

    function setBaseURI(string memory newBaseURI) public onlyOwner {
        _baseTokenURI = newBaseURI;
    }
    
    function getBaseURI() public view returns (string memory) {
        return _baseTokenURI;
    }
    
    // Override the _baseURI internal function
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Required override for ERC2981 and ERC721 compatibility
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Handle token transfer updates
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        
        // Remove token from previous owner's list
        if (from != address(0)) {
            uint256[] storage fromTokens = _ownedTokens[from];
            for (uint256 i = 0; i < fromTokens.length; i++) {
                if (fromTokens[i] == tokenId) {
                    // Move the last element to the deleted position
                    fromTokens[i] = fromTokens[fromTokens.length - 1];
                    // Remove the last element
                    fromTokens.pop();
                    break;
                }
            }
        }
        
        // Add token to the new owner's list
        if (to != address(0)) {
            // Check if token is already in the owner's list to avoid duplicates
            bool tokenExists = false;
            for (uint256 i = 0; i < _ownedTokens[to].length; i++) {
                if (_ownedTokens[to][i] == tokenId) {
                    tokenExists = true;
                    break;
                }
            }
            
            // Only add if it doesn't already exist
            if (!tokenExists) {
                _ownedTokens[to].push(tokenId);
            }
        }
        
        return from;
    }
} 