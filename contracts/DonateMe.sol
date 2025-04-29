// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// contract for store state and modifer
abstract contract StateAndModifier {
    // base state
    address payable public owner;
    uint public totalAllDonation = 0;

    // Enums define
    enum PaymentTier {
        Coffe,
        Hotdog,
        Caviar
    }

    // struct schema define
    struct DonationDetail {
        address from;
        uint amount;
        PaymentTier tier;
        string message;
        uint timestamp;
    }

    // mapping define
    mapping(address => DonationDetail[]) public donationHistory;

    // event define
    event DonationReceived(address indexed from, uint amount, string message);
    event OwnerWithdraw(address indexed to, uint amount, string description);

    // modifer define
    modifier OnlyOwner() {
        require(msg.sender == owner, "Only Owner can access");
        _;
    }
}

// the main contract
contract DonateMe is StateAndModifier {
    constructor() {
        owner = payable(msg.sender);
    }

    // note: ada ada masalah dengan payment transactnya
    function donate(uint8 _tierRaw, string memory _message) public payable {
        require(_tierRaw <= uint8(PaymentTier.Caviar), "Tier Choses not found");
        require(msg.sender != owner, "Owner can`t donate hismself");
        require(msg.value > 0, "Donation amount must be greater than 0");

        // define local variable
        uint amount;
        bool success;

        // cast _tier to ENUM PaymentTier
        PaymentTier _tier = PaymentTier(_tierRaw);

        // check if tier donate is same with criteria

        if (_tier == PaymentTier.Coffe) {
            amount = 0.0002 ether; // 10k
            require(msg.value >= amount, "Insufficient donation for tier");
            payable(owner).transfer(amount);
            success = true;
        } else if (_tier == PaymentTier.Hotdog) {
            amount = 0.001 ether; // 50k
            require(msg.value >= amount, "Insufficient donation for tier");
            payable(owner).transfer(amount);
            success = true;
        } else if (_tier == PaymentTier.Caviar) {
            amount = 0.005 ether; // 250k
            require(msg.value >= amount, "Insufficient donation for tier");
            payable(owner).transfer(amount);
            success = true;
        }

        // check if error send eth to owner
        require(success, "Transaction Failed");

        // set detail for history
        DonationDetail memory detail = DonationDetail({
            from: msg.sender,
            amount: amount,
            message: _message,
            timestamp: block.timestamp,
            tier: _tier
        });

        // push detail to blockchain storage
        donationHistory[msg.sender].push(detail);

        // add total donation to blockchain (use actual received amount)
        totalAllDonation += amount;

        // emit event for logs
        emit DonationReceived(msg.sender, amount, _message);
    }

    function withdrawRemainBalance(
        string memory _desc
    ) public payable OnlyOwner {
        uint contractAddressBalance = address(this).balance;

        payable(owner).transfer(contractAddressBalance);

        emit OwnerWithdraw(owner, contractAddressBalance, _desc);
    }

    function getTotalDonation() public view returns (uint) {
        return totalAllDonation;
    }

    function getHistoryDonate() public view returns (DonationDetail[] memory) {
        DonationDetail[] memory detailUser = donationHistory[msg.sender];

        return detailUser;
    }
}
