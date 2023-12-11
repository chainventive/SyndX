// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/* Custom errors for Syndx Co-Property Management System */

/// @notice Error indicating that a token ISO identifier is too long.
error TokenISOTooLong();

/// @notice Error indicating that a token ISO identifier is too short.
error TokenISOTooShort();

/// @notice Error indicating an invalid token owner address.
/// @param providedAddress The invalid address provided.
error InvalidTokenOwnerAddress(address providedAddress);

/// @notice Error indicating an invalid syndic address.
/// @param providedAddress The invalid address provided.
error InvalidSyndicAddress(address providedAddress);

/// @notice Error indicating an invalid governance token address.
/// @param providedAddress The invalid address provided.
error InvalidGovernanceTokenAddress(address providedAddress);

/// @notice Error indicating that the caller is not the token administrator.
/// @param administrator The expected administrator address.
/// @param caller The address of the caller.
error NotTokenAdministrator (address administrator, address caller);

/// @notice Error indicating that the sender is not authorized to send tokens.
/// @param sender The address attempting to send tokens.
/// @param recipiant The intended recipient address.
error NotAuthorizedToSendTokens (address sender, address recipiant);

/// @notice Error indicating that the recipient is not authorized to receive tokens.
/// @param sender The address attempting to send tokens.
/// @param recipiant The intended recipient address.
error NotAuthorizedToReceiveTokens (address sender, address recipiant);

/// @notice Error indicating that the vote tokens have already been claimed by the address.
/// @param claimer The address that has already claimed vote tokens.
error VoteTokensAlreadyClaimed (address claimer);

/// @notice Error indicating that the property shares balance of the caller is zero.
/// @param caller The address of the caller with zero property shares.
error PropertySharesBalanceIsZero (address caller);

/// @notice Error indicating that the vote token is locked up and cannot be transferred.
/// @param lockupTime The timestamp until which the token is locked up.
error VoteTokenLockedUp (uint256 lockupTime);

/// @notice Error indicating unauthorized token transfer.
/// @param sender The address attempting the transfer.
/// @param recipient The intended recipient of the transfer.
error TokenTransferUnauthorized (address sender, address recipient);

/// @notice Error indicating that the operation is not authorized.
error NotAuthorized();

/// @notice Error indicating that the property owner has already been added.
/// @param propertyOwner The address of the property owner who has already been added.
error PropertyOwnerAlreadyAdded(address propertyOwner);