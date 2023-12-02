// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../../common/SDX.sol";

interface IGeneralAssembly {

    // Callback function to allow the syndx contract to provide the requested tiebreak number
    // We protect the contract against tiebreaker overwrites. This mean once the tiebreak number is set, it is forever
    function fulfillTiebreaker(uint256 _tiebreaker) external;

    function getLockupTime() external view returns (uint256);
}