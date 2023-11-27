// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Syndic contract import
import "../token/SynToken.sol";
import "../token/ISynToken.sol";

interface ISyndxFactory {

    // Create a new SynToken contract
    function createSynToken(string memory _name, string memory _symbol, address _admin) external returns(address);

    // Create a new SynToken contract
    function createMeeting(ISynToken synToken) external returns(address);
}