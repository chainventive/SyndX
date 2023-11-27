// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Base.sol";
import "../common/Errors.sol";
import "../common/Constants.sol";

// Interfaces imports
import "../token/ISynToken.sol";
import "../meeting/IAGMeeting.sol";

contract AGMeeting is IAGMeeting, Ownable, Base {

    // Coproperty token contract
    // Used here to check if an address can sumbmit a resolution or an amendment
    ISynToken public token;

    // List of meeting resolutions
    Resolution[] resolutions;

    // List of resolution amendements
    Amendment[] amendments;

    // Event emitted when a new resolution is added
    event ResolutionAdded(uint256 id, address author);

    // Event emitted when a new amendment is added
    event AmendementAdded(uint256 id, uint256 resolutionID, address author);

    // Ensure only property owner can call this function
    modifier onlyCopropertyMembers
    {
        if (msg.sender != owner() && token.balanceOf(msg.sender) > 0) revert CopropertyMemberExpected();
        _;
    }

    // We let the AGMeeting contract under the syndic ownership that is the only allowed to create a meeting from the coproperty contract
    constructor(ISynToken synToken) Ownable(msg.sender) {

        // The token contract must be created
        if (address(synToken) == address(0)) revert MissingTokenContract();
    }

    // Add a resolution
    function addResolution(string calldata _title, string calldata _description) external onlyCopropertyMembers {

        // Checks that title length is valid
        uint256 titleLen = bytes(_title).length;
        if (titleLen < Constants.TITLE_MIN_LENGHT || titleLen > Constants.TITLE_MAX_LENGHT) revert InvalidTitleLength();

        // Checks that description length is valid
        uint256 descriptionLen = bytes(_description).length;
        if (descriptionLen < Constants.DESCRIPTION_MIN_LENGHT || descriptionLen > Constants.DESCRIPTION_MAX_LENGHT) revert InvalidDescriptionLength();

        // Create the resolution and add it to the list of resolutions
        resolutions.push(Resolution(_title, _description, msg.sender));

        // Emit an event to alert that a new resolution has been added
        emit ResolutionAdded(resolutions.length-1, msg.sender);
    }

    // Amend a resolution
    function amendResolution(uint256 _resolutionID, string calldata _description) external onlyCopropertyMembers {

        // Checks that the resolutionID exists
        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        // Checks that description length is valid
        uint256 descriptionLen = bytes(_description).length;
        if (descriptionLen < Constants.DESCRIPTION_MIN_LENGHT || descriptionLen > Constants.DESCRIPTION_MAX_LENGHT) revert InvalidDescriptionLength();
    
        // Create an amendement and add it to the list
        amendments.push(Amendment(_resolutionID, _description, msg.sender));

        // Emit an event to alert that a new amendment has been added
        emit AmendementAdded(amendments.length-1, _resolutionID, msg.sender);
    }
}