// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IGovernanceToken is IERC20 {

    // Get the token ISO
    function getTokenISO() external view returns(bytes memory);

    // Get if an address is whitelisted
    function isWhitelisted(address _address) external view returns(bool);

    // Set the administrator of the coproperty governance token
    function setAdministrator(address _address) external;

    // Add a property owner to the governance token contract
    function addPropertyOwner(address _address, uint256 _propertyShares) external;

    // Remove a property owner from the governance token contract
    function removePropertyOwner(address _address) external;

    // Transfert property shares from a property owner to another property owner
    function transfertPropertyShares(address _from, address _to) external;
}