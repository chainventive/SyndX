// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Common imports
import "../_common/errors/tokenFactory.sol";

// Contracts imports
import "./vote/VoteToken.sol";
import "./governance/GovernanceToken.sol";

/// @title TokenFactory Contract
/// @notice Contract for creating Governance and Vote tokens within the Syndx ecosystem
/// @dev Inherits from Ownable, indicating ownership functionalities
contract TokenFactory is Ownable {

    /// @notice Address of the Syndx contract
    address public syndx;

    /// @notice Ensures that only Syndx or the owner can call certain functions
    /// @dev Restricts function access to the Syndx contract or the contract owner
    modifier onlyAdministrators {
        if (msg.sender != syndx && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    /// @notice Initializes the TokenFactory contract
    /// @dev Sets the Syndx contract address and initializes the contract's owner
    /// @param _syndx Address of the Syndx contract
    constructor(address _syndx) Ownable (msg.sender) {
        syndx = _syndx;
    }

    /// @notice Creates a new Governance Token
    /// @dev Can only be called by Syndx administrators
    /// @param _tokenISO ISO code for the governance token
    /// @param _syndic Address of the syndic associated with the token
    /// @param _owner Address of the owner of the new token
    /// @return The address of the newly created Governance Token contract
    function createGovernanceToken(string memory _tokenISO, address _syndic, address _owner) external onlyAdministrators returns (address) {
        
        if (_syndic == address(0)) revert InvalidSyndicAddress(_syndic);
        if (_owner == address(0)) revert InvalidTokenOwnerAddress(_owner);

        if (bytes(_tokenISO).length < TOKEN_ISO_MIN_LENGHT) revert TokenISOTooShort();
        if (bytes(_tokenISO).length > TOKEN_ISO_MAX_LENGHT) revert TokenISOTooLong(); 

        bytes memory tokenName   = abi.encodePacked("SyndX Governance", " ", _tokenISO);
        bytes memory tokenSymbol = abi.encodePacked("syn", _tokenISO);

        GovernanceToken governanceToken = new GovernanceToken(_tokenISO, string(tokenName), string(tokenSymbol), _syndic, _owner);

        return address(governanceToken);
    }

    /// @notice Creates a new Vote Token for a specific general assembly
    /// @dev Can only be called by Syndx administrators
    /// @param _tokenISO ISO code for the vote token
    /// @param _generalAssemblyID The ID of the general assembly for which the token is created
    /// @param _syndic Address of the syndic associated with the token
    /// @param _governanceToken Address of the associated Governance Token
    /// @return The address of the newly created Vote Token contract
    function createVoteToken(string memory _tokenISO, uint256 _generalAssemblyID, address _syndic, address _governanceToken) external onlyAdministrators returns (address) {

        if (_syndic == address(0)) revert InvalidSyndicAddress(_syndic);
        if (_governanceToken == address(0)) revert InvalidGovernanceTokenAddress(_governanceToken);

        if (bytes(_tokenISO).length < TOKEN_ISO_MIN_LENGHT) revert TokenISOTooShort();
        if (bytes(_tokenISO).length > TOKEN_ISO_MAX_LENGHT) revert TokenISOTooLong(); 

        bytes memory tokenName = abi.encodePacked("SyndX Vote", " ", _tokenISO, Strings.toString(_generalAssemblyID));
        bytes memory tokenSymbol = abi.encodePacked("vote", _tokenISO, Strings.toString(_generalAssemblyID));

        VoteToken voteToken = new VoteToken(msg.sender, _governanceToken, _syndic, string(tokenName), string(tokenSymbol));

        return address(voteToken);
    }
}