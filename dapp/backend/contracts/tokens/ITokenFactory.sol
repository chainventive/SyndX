// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @title ITokenFactory Interface
/// @notice Interface for the TokenFactory contract defining functionalities for creating governance and vote tokens
interface ITokenFactory {

    /// @notice Creates a new Governance Token
    /// @dev Expected to be implemented to handle the creation of governance tokens with specified parameters
    /// @param _tokenISO ISO code for the governance token
    /// @param _syndic Address of the syndic associated with the governance token
    /// @param _owner Address of the owner of the governance token
    /// @return The address of the newly created Governance Token contract
    function createGovernanceToken(string memory _tokenISO, address _syndic, address _owner) external returns (address);

    /// @notice Creates a new Vote Token for a specific general assembly
    /// @dev Expected to be implemented to handle the creation of vote tokens for use in general assembly voting processes
    /// @param _tokenISO ISO code for the vote token
    /// @param _generalAssemblyID The ID of the general assembly for which the token is created
    /// @param _syndic Address of the syndic associated with the vote token
    /// @param _governanceToken Address of the associated Governance Token
    /// @return The address of the newly created Vote Token contract
    function createVoteToken(string memory _tokenISO, uint256 _generalAssemblyID, address _syndic, address _governanceToken) external returns (address);
}