// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @title ISyndx Interface
/// @notice Interface for the Syndx contract defining key functionalities for general assembly creation and random number requests
interface ISyndx {

    /// @notice Creates a new general assembly contract
    /// @dev Only callable by known coproperty contracts within the Syndx ecosystem
    /// @param _voteStartTime The start time for voting in the new general assembly
    /// @return The address of the newly created general assembly contract
    function createGeneralAssembly(uint256 _voteStartTime) external returns (address);

    /// @notice Requests a random number for authorized contracts
    /// @dev Can only be called by contracts that are authorized to request random numbers in the Syndx ecosystem
    function requestRandomNumber() external;
}