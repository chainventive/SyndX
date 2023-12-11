// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../_common/SDX.sol";

/// @title Interface for managing general assemblies in a co-property system.
interface IGeneralAssembly {

    /// @notice Callback function to allow the syndic contract to provide the requested tiebreak number.
    /// @dev Protects against overwriting the tiebreaker number; once set, it is permanent.
    /// @param _tiebreaker The tiebreak number provided by the syndic contract.
    function fulfillTiebreaker(uint256 _tiebreaker) external;

    /// @notice Retrieves the lockup time for the general assembly.
    /// @dev Lockup time is usually set to restrict certain actions during the decision-making process.
    /// @return The lockup time in seconds.
    function getLockupTime() external view returns (uint256);
}