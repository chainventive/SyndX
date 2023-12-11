// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/* Custom errors for Syndx Co-Property Management System */

/// @notice Error indicating that a co-property with the given name has already been created.
/// @param name The name of the co-property.
error CopropertyAlreadyCreated(string name);

/// @notice Error indicating that a token ISO identifier is too short.
/// @param iso The token ISO identifier that was attempted to be set.
error TokenISOTooShort (string iso);

/// @notice Error indicating that a token ISO identifier is too long.
/// @param iso The token ISO identifier that was attempted to be set.
error TokenISOTooLong (string iso);

/// @notice Error indicating an unauthorized randomness consumer.
/// @param consumer The address of the unauthorized consumer.
error UnauthorizedRandomnessConsumer (address consumer);

/// @notice Error indicating an unknown co-property contract address.
/// @param contractAddress The address of the co-property contract.
error UnknownCopropertyContract (address contractAddress);

/// @notice Error indicating that a consumer request was not found.
/// @param consumer The address of the consumer.
error ConsumerRequestNotFound (address consumer);

/// @notice Error indicating that a consumer request has already been fulfilled.
/// @param consumer The address of the consumer.
/// @param requestId The ID of the request that has been fulfilled.
error ConsumerRequestAlreadyFulfilled (address consumer, uint256 requestId);

/// @notice Error indicating that the lockup period for a random number request has not yet ended.
/// @param currentBlockNumber The current block number.
/// @param targetBlockNumber The target block number when the lockup ends.
error RandomNumberRequestLockupNotEndedYet (uint256 currentBlockNumber, uint256 targetBlockNumber);

/// @notice Error indicating that a random number request has already been made.
/// @param requestId The ID of the request that has already been made.
error RandomNumberRequestAlreadyMade (uint256 requestId);
