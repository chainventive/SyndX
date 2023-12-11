// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Interface for the governance token.
/// @dev Extends the standard IERC20 interface to include functionalities specific to co-ownership governance.
interface IGovernanceToken is IERC20 {

    /// @notice Returns the ISO of the token.
    /// @dev This function retrieves the standardized identifier of the token.
    /// @return The ISO of the token as a string.
    function getTokenISO() external view returns(string memory);

    /// @notice Checks if an address is on the whitelist.
    /// @dev This function determines if an address is authorized within the governance framework.
    /// @param _address The address to check.
    /// @return True if the address is on the whitelist, false otherwise.
    function isWhitelistedAddress(address _address) external view returns(bool);

    /// @notice Sets the administrator of the co-ownership governance token.
    /// @param _address The address of the administrator to be set.
    function setAdministrator(address _address) external;

    /// @notice Adds a property owner to the governance token contract.
    /// @dev This function adds a new owner along with their property shares.
    /// @param _address The address of the new owner.
    /// @param _propertyShares The number of property shares associated with the owner.
    function addPropertyOwner(address _address, uint256 _propertyShares) external;

    /// @notice Removes a property owner from the governance token contract.
    /// @param _address The address of the property owner to be removed.
    function removePropertyOwner(address _address) external;
}