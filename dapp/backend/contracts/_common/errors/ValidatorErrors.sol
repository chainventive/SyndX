// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/* Custom errors for Syndx Co-Property Management System */

/// @notice Error indicating that a co-property name is too short.
/// @param name The co-property name that was attempted to be set.
error CopropertyNameTooShort (string name);

/// @notice Error indicating that a co-property name is too long.
/// @param name The co-property name that was attempted to be set.
error CopropertyNameTooLong (string name);

/// @notice Error indicating that a token ISO identifier is too short.
/// @param iso The token ISO identifier that was attempted to be set.
error TokenISOTooShort (string iso);

/// @notice Error indicating that a token ISO identifier is too long.
/// @param iso The token ISO identifier that was attempted to be set.
error TokenISOTooLong (string iso);

/// @notice Error indicating that a resolution title is too short.
/// @param name The title of the resolution that was attempted to be set.
error TitleTooShort (string name);

/// @notice Error indicating that a resolution title is too long.
/// @param name The title of the resolution that was attempted to be set.
error TitleTooLong (string name);

/// @notice Error indicating that a description for a resolution or amendment is too short.
/// @param name The description that was attempted to be set.
error DescriptionTooShort (string name);

/// @notice Error indicating that a description for a resolution or amendment is too long.
/// @param name The description that was attempted to be set.
error DescriptionTooLong (string name);