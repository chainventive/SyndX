// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";

contract Syndx is Ownable {

    // Syndx contract is owned by its deployer
    constructor() Ownable (msg.sender) {

    }
}