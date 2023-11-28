// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../common/Enums.sol";

// Syndic contract import
import "../token/SynToken.sol";
import "../token/ISynToken.sol";

interface ISyndxFactory {

    // Return a SynToken contract
    function getSynToken(string memory _name, string memory _symbol, address _admin) external returns(address);

    // Return a AGMeeting contract
    function getMeeting(ISynToken synToken, address _syndic, uint256 _votingStartTime) external returns(address);
}