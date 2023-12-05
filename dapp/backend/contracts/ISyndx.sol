// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface ISyndx {

    // Create a new general assembly contract (only knowns coproperty contracts can call this function)
    function createGeneralAssembly(uint256 _voteStartTime) external returns (address);

    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber() external;
}