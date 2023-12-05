// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IVoteToken is IERC20 {

    // Set the lockup time after which tokens are not allowed to move
    function setLockupTime (uint256 _lockupTime) external;
}