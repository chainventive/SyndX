// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Interface for the vote token.
/// @dev Extends the standard IERC20 interface to include specific functionalities for vote tokens.
interface IVoteToken is IERC20 {

    /// @notice Sets the lockup time after which tokens can no longer be transferred.
    /// @dev This function must be implemented to allow the configuration of the token lockup time.
    /// @param _lockupTime The lockup time in seconds.
    function setLockupTime (uint256 _lockupTime) external;
}