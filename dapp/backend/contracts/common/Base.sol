// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Base {

    struct Resolution {
        string  title;
        string  description;
        address author;
    }

    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }
}