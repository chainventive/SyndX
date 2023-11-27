// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IAGMeeting {

    // Add a resolution
    function addResolution(string calldata _title, string calldata _description) external;

    // Amend a resolution
    function amendResolution(uint256 _resolutionID, string calldata _description) external;
}