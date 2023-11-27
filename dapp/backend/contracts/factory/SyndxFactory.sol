// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Errors.sol";

// Interfaces imports
import "../factory/ISyndxFactory.sol";
import "../token/ISynToken.sol";

// Syndx imports
import "../token/SynToken.sol";
import "../meeting/AGMeeting.sol";


// This contract is here to ensure 
contract SyndxFactory is ISyndxFactory, Ownable {

    constructor() Ownable(msg.sender) {}

    // Create a new SynToken contract
    function createSynToken(string memory _name, string memory _symbol, address _admin) external returns (address) {

        SynToken synToken = new SynToken(_name, _symbol, _admin);

        return address(synToken);
    }

    // Create a new AGMeeting contract
    function createMeeting(ISynToken synToken) external returns(address) {
        
        AGMeeting meeting = new AGMeeting(synToken);

        return address(meeting);
    }
}