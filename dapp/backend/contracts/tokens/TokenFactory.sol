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

contract TokenFactory is Ownable {

    address public syndx;

    modifier onlyAdministrators {
        if (msg.sender != syndx && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    // The token factory contract is owned by the syndx contract
    constructor(address _syndx) Ownable (msg.sender) {
        syndx = _syndx;
    }

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