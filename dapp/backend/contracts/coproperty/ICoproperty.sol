// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Interfaces imports
import "../tokens/governance/IGovernanceToken.sol";

/// @title Interface for a co-property management system.
interface ICoproperty {

    /// @notice Retrieves the address of the syndic in charge of the co-property contract.
    /// @dev The syndic is responsible for managing the co-property.
    /// @return The address of the syndic.
    function getSyndic() external view returns (address);

    /// @notice Retrieves the governance token associated with the co-property.
    /// @dev This token may be used for voting and other governance actions within the co-property.
    /// @return The governance token as an `IGovernanceToken` instance.
    function getGovernanceToken() external view returns (IGovernanceToken);

    /// @notice Gets the total number of general assemblies held for the co-property.
    /// @dev General assemblies are typically held for making major decisions about the co-property.
    /// @return The total number of general assemblies.
    function getGeneralAssemblyCount() external view returns (uint256);
}