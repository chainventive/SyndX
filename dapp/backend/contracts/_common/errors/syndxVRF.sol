// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/* Custom errors for Syndx Co-Property Management System */

/// @notice Error indicating that a request has already been fulfilled.
error RequestAlreadyFullfilled ();

/// @notice Error indicating that the Chainlink random words array is empty.
error EmptyChainlinkRandomWords ();