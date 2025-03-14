// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Counter {
    uint256 private count;
    
    // Event emitted when the counter changes
    event CountChanged(uint256 newCount);
    
    constructor(uint256 _initialCount) {
        count = _initialCount;
    }
    
    // Get the current count
    function getCount() public view returns (uint256) {
        return count;
    }
    
    // Increment the count
    function increment() public {
        count += 1;
        emit CountChanged(count);
    }
    
    // Decrement the count
    function decrement() public {
        require(count > 0, "Count cannot be negative");
        count -= 1;
        emit CountChanged(count);
    }
}