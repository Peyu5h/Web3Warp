// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address private owner;
    uint256 private escrowCount;

    enum EscrowStatus { Pending, Completed, Refunded, Disputed }

    struct EscrowAgreement {
        uint256 id;
        address buyer;
        address seller;
        address arbiter; //Optional
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt; //in sec
        EscrowStatus status;
        bool isFunded;
    }

    // escrowId -> agreement
    mapping(uint256 => EscrowAgreement) public escrows;
    
    // userAddress -> escrowIds[]
    mapping(address => uint256[]) private userEscrows;

    event EscrowCreated(
        uint256 indexed id,
        address indexed buyer,
        address indexed seller,
        address arbiter,
        uint256 amount,
        uint256 expiresAt
    );
    
    event EscrowFunded(uint256 indexed id, uint256 amount);
    event EscrowCompleted(uint256 indexed id);
    event EscrowRefunded(uint256 indexed id);
    event EscrowDisputed(uint256 indexed id);

    modifier onlyBuyer(uint256 _id) {
        require(msg.sender == escrows[_id].buyer, "Only buyer can call this function");
        _;
    }

    modifier onlySeller(uint256 _id) {
        require(msg.sender == escrows[_id].seller, "Only seller can call this function");
        _;
    }

    modifier onlyArbiter(uint256 _id) {
        require(
            escrows[_id].arbiter != address(0) && msg.sender == escrows[_id].arbiter,
            "Only arbiter can call this function"
        );
        _;
    }

    modifier escrowExists(uint256 _id) {
        require(_id < escrowCount, "Escrow does not exist");
        _;
    }

    modifier escrowPending(uint256 _id) {
        require(escrows[_id].status == EscrowStatus.Pending, "Escrow is not pending");
        _;
    }

    modifier escrowFunded(uint256 _id) {
        require(escrows[_id].isFunded, "Escrow is not funded");
        _;
    }

    constructor() {
        owner = msg.sender;
        escrowCount = 0;
    }


    function createEscrow(
        address _seller,
        address _arbiter,
        uint256 _expiryDays
    ) external payable returns (uint256) {
        require(_seller != address(0), "Seller address cannot be zero");
        require(_seller != msg.sender, "Buyer and seller cannot be the same");
        require(msg.value > 0, "Amount must be greater than zero");
        require(_expiryDays > 0, "Expiry days must be greater than zero");

        uint256 expiryTime = block.timestamp + (_expiryDays * 1 days);
        
        uint256 id = escrowCount;
        escrows[id] = EscrowAgreement({
            id: id,
            buyer: msg.sender,
            seller: _seller,
            arbiter: _arbiter,
            amount: msg.value,
            createdAt: block.timestamp,
            expiresAt: expiryTime,
            status: EscrowStatus.Pending,
            isFunded: true
        });
        
        userEscrows[msg.sender].push(id); // Add to buyer's list
        userEscrows[_seller].push(id); // Add to seller's list
        
        if (_arbiter != address(0)) {
            userEscrows[_arbiter].push(id); // Add to arbiter's list
        }
        
        escrowCount++;
        
        emit EscrowCreated(id, msg.sender, _seller, _arbiter, msg.value, expiryTime);
        emit EscrowFunded(id, msg.value);
        
        return id;
    }

    function createUnfundedEscrow(
        address _seller,
        address _arbiter,
        uint256 _amount,
        uint256 _expiryDays
    ) external returns (uint256) {
        require(_seller != address(0), "Seller address cannot be zero");
        require(_seller != msg.sender, "Buyer and seller cannot be the same");
        require(_amount > 0, "Amount must be greater than zero");
        require(_expiryDays > 0, "Expiry days must be greater than zero");

        uint256 expiryTime = block.timestamp + (_expiryDays * 1 days);
        
        uint256 id = escrowCount;
        escrows[id] = EscrowAgreement({
            id: id,
            buyer: msg.sender,
            seller: _seller,
            arbiter: _arbiter,
            amount: _amount,
            createdAt: block.timestamp,
            expiresAt: expiryTime,
            status: EscrowStatus.Pending,
            isFunded: false
        });
        
        userEscrows[msg.sender].push(id); // Add to buyer's list
        userEscrows[_seller].push(id); // Add to seller's list
        
        if (_arbiter != address(0)) {
            userEscrows[_arbiter].push(id); // Add to arbiter's list
        }
        
        escrowCount++;
        
        emit EscrowCreated(id, msg.sender, _seller, _arbiter, _amount, expiryTime);
        
        return id;
    }

    function depositToEscrow(uint256 _id) 
        external 
        payable
        escrowExists(_id) 
        escrowPending(_id)
        onlyBuyer(_id)
    {
        EscrowAgreement storage escrow = escrows[_id];
        
        require(!escrow.isFunded, "Escrow is already funded");
        require(msg.value == escrow.amount, "Deposit amount must match escrow amount");
        
        escrow.isFunded = true;
        
        emit EscrowFunded(_id, msg.value);
    }


    function getRequiredFunds(uint256 _id) 
        external 
        view 
        escrowExists(_id) 
        returns (uint256) 
    {
        return escrows[_id].amount;
    }


    function releaseEscrow(uint256 _id) 
        external 
        escrowExists(_id) 
        escrowPending(_id) 
        escrowFunded(_id) 
    {
        EscrowAgreement storage escrow = escrows[_id];
        
        // Only the buyer or arbiter can release funds
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.arbiter,
            "Only buyer or arbiter can release"
        );
        
        escrow.status = EscrowStatus.Completed;
        
        payable(escrow.seller).transfer(escrow.amount);
        
        emit EscrowCompleted(_id);
    }

    function refundEscrow(uint256 _id) 
        external 
        escrowExists(_id) 
        escrowPending(_id) 
        escrowFunded(_id) 
    {
        EscrowAgreement storage escrow = escrows[_id];
        
        require(
            msg.sender == escrow.seller || msg.sender == escrow.arbiter,
            "Only seller or arbiter can refund"
        );
        
        escrow.status = EscrowStatus.Refunded;
        
        payable(escrow.buyer).transfer(escrow.amount);
        
        emit EscrowRefunded(_id);
    }


    function refundExpiredEscrow(uint256 _id) 
        external 
        escrowExists(_id) 
        escrowPending(_id) 
        escrowFunded(_id) 
    {
        EscrowAgreement storage escrow = escrows[_id];
        
        require(block.timestamp > escrow.expiresAt, "Escrow has not expired yet");
        
        escrow.status = EscrowStatus.Refunded;
        
        payable(escrow.buyer).transfer(escrow.amount);
        
        emit EscrowRefunded(_id);
    }


    function disputeEscrow(uint256 _id) 
        external 
        escrowExists(_id) 
        escrowPending(_id) 
        onlyArbiter(_id) 
    {
        escrows[_id].status = EscrowStatus.Disputed;
        
        emit EscrowDisputed(_id);
    }

    function getEscrowsByUser(address _user) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }


    function getEscrowsAsBuyer(address _user) external view returns (uint256[] memory) {
        uint256[] memory allEscrows = userEscrows[_user];
        uint256[] memory buyerEscrows = new uint256[](allEscrows.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allEscrows.length; i++) {
            if (escrows[allEscrows[i]].buyer == _user) {
                buyerEscrows[count] = allEscrows[i];
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(buyerEscrows, count)
        }
        
        return buyerEscrows;
    }

    function getEscrowsAsSeller(address _user) external view returns (uint256[] memory) {
        uint256[] memory allEscrows = userEscrows[_user];
        uint256[] memory sellerEscrows = new uint256[](allEscrows.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allEscrows.length; i++) {
            if (escrows[allEscrows[i]].seller == _user) {
                sellerEscrows[count] = allEscrows[i];
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(sellerEscrows, count)
        }
        
        return sellerEscrows;
    }


    function getEscrowsAsArbiter(address _user) external view returns (uint256[] memory) {
        uint256[] memory allEscrows = userEscrows[_user];
        uint256[] memory arbiterEscrows = new uint256[](allEscrows.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allEscrows.length; i++) {
            if (escrows[allEscrows[i]].arbiter == _user) {
                arbiterEscrows[count] = allEscrows[i];
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(arbiterEscrows, count)
        }
        
        return arbiterEscrows;
    }

    function getEscrowDetails(uint256 _id) 
        external 
        view 
        escrowExists(_id) 
        returns (EscrowAgreement memory) 
    {
        return escrows[_id];
    }

    function getEscrowCount() external view returns (uint256) {
        return escrowCount;
    }
} 