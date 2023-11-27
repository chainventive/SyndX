// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ISynToken is IERC20 {

    function setAdmin(address _address) external;

    function setWhitelist(address _address, bool _allowed) external;
}