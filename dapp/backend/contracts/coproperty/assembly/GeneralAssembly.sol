// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../common/SDX.sol";
import "../../common/SyndxValidations.sol";

// Interfaces imports
import '../token/ICopropertyToken.sol';

// Contracts imports
import "../../Syndx.sol";
import "../Coproperty.sol";

contract GeneralAssembly is SyndxValidations, Ownable {

    // The syndx contract
    Syndx private syndx;

    // The syndic account in charge of this general assembly
    address syndic;

    // The governance token of the coproperty
    ICopropertyToken governanceToken;

    // The general assembly timeline
    uint256 public created;    // When the general assembly was created
    uint256 public lockup;      // Resolution and amendements cannot be created after this time
    uint256 public voteStart;   // When the voting session starts
    uint256 public voteEnd;     // When the voting session ends

    // The resolutions to be voted
    SDX.Resolution[] resolutions;

    // The amendments committed to resolutions
    SDX.Amendment[] amendments;

    // Emmitted when a new resolution is created
    event ResolutionCreated(uint256 id, address author);

    // Emmitted when a new amendment is created
    event AmendmentCreated(uint256 id, uint256 resolutionID, address author);

    // Emitted when a resolution vote type has changed
    event ResolutionVoteTypeChanged(uint256 id, SDX.VoteType typeBefore, SDX.VoteType typeAfter);

    // Ensure tha the caller is the coproperty syndic
    modifier onlyCopropertySyndic {
        if (msg.sender != syndic) revert ("You are not the syndic of the coproperty");
        _;
    }

    // Ensure that the caller is a member of the coproperty (the syndic and the property share holders)
    modifier onlyCopropertyMembers {
        if (msg.sender != syndic && governanceToken.balanceOf(msg.sender) <= 0) revert ("You are not member of the coproperty");
        _;
    }

    // ENsure that the caller is a coproperty governance token holder
    modifier onlyGovernanceTokenHolders {
        if (governanceToken.balanceOf(msg.sender) <= 0) revert ("You are not a governance token holder");
        _;
    }

    // Ensure the call was made before the start of lockup period
    modifier onlyBeforeLockup {
        if (block.timestamp > lockup) revert ("Lockup period has started");
        _;
    }

    // Ensure the call was made during the voting session
    modifier onlyDuringVotingSession {
        if (block.timestamp < voteStart) revert ("Voting session not started yet");
        if (block.timestamp > voteEnd) revert ("Voting session has ended");
        _;
    }

    // Ensure the call was made after the voting session ended
    modifier onlyAfterVotingSession {
        if (block.timestamp < voteEnd) revert ("Voting session not ended yet");
        _;
    }

    // This contract remain owned by Syndx
    constructor(Syndx _syndx, Coproperty _coproperty, uint256 _voteStartTime) Ownable(msg.sender) {

        syndx = _syndx;
        syndic = _coproperty.syndic();
        governanceToken = _coproperty.governanceToken();

        _setMeetingTimeline(_voteStartTime);
    }

    // Set the general assembly timeline according to the expected start time
    function _setMeetingTimeline(uint256 _voteStartTime) private {

        // When the general assembly is created
        created = block.timestamp;

        // Calculated lockup time according to the expected vote start time
        lockup = _voteStartTime - GENERAL_ASSEMBLY_LOCKUP_DURATION;

        // If the calculated lockup time occurs after the general assembly calculation we revert
        if (created > lockup) revert ResolutionLockupTimeComeToEarly(created, lockup, _voteStartTime);
        
        // If the timespan between the creation time and the start of the lockup is to short we revert cause we havent enought time to handle resolution submission and a safe enough lockup period
        if (lockup - created < GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP) revert ResolutionLockupTimeComeToEarly(created, lockup, _voteStartTime);

        // Set the vote start time
        voteStart = _voteStartTime;

        // Calculate the vote end time
        voteEnd = _voteStartTime + GENERAL_ASSEMBLY_VOTING_SESSION_DURATION;
    }

    // Returns the general assembly timeline
    function getTimeline() external view returns (SDX.GeneralAssemblyTimeline memory) {

        return SDX.GeneralAssemblyTimeline(created, lockup, voteStart, voteEnd);
    }

    // Create a new resolution
    function createResolution(string calldata _title, string calldata _description) external onlyCopropertyMembers onlyBeforeLockup validTitle(_title) validDescription(_description) returns (uint256) {

        SDX.Resolution memory resolution = SDX.createResolution(_title, _description, msg.sender);

        resolutions.push(resolution);

        uint256 resolutionID = resolutions.length - 1;

        emit ResolutionCreated(resolutionID, msg.sender);

        return resolutionID;
    }

    // Create a new amendment
    function createAmendment(uint256 _resolutionID, string calldata _description) external onlyCopropertyMembers onlyBeforeLockup validDescription(_description) returns (uint256)  {

        if (_resolutionID >= resolutions.length) revert ("Unknown resolution ID");

        SDX.Amendment memory amendement = SDX.createAmendment(_resolutionID, _description, msg.sender);

        amendments.push(amendement);

        uint256 amendmentID = amendments.length - 1;

        emit AmendmentCreated(amendmentID, _resolutionID, msg.sender);

        return amendmentID;
    }

    // Get the total number of resolutions
    function getResolutionCount() external view returns (uint256) {
        return resolutions.length;
    }

    // Get a given resolution
    function getResolution(uint256 _id) external view returns (SDX.Resolution memory) {
        
        if (_id >= resolutions.length) revert ("Unknown resolution ID");

        return resolutions[_id];
    }

    // Get the total number of amendments
    function getAmendmentCount() external view returns (uint256) {
        return amendments.length;
    }

    // Get a given amendment
    function getAmendment(uint256 _id) external view returns (SDX.Amendment memory) {
        
        if (_id >= amendments.length) revert ("Unknown amendment ID");

        return amendments[_id];
    }

    // Set a given resolution vote type
    function setResolutionVoteType(uint256 _id, SDX.VoteType _voteType) external onlyCopropertySyndic onlyBeforeLockup {

        if (_id >= resolutions.length) revert ("Unknown resolution ID");

        if (_voteType == SDX.VoteType.Undefined) revert ("Unknown resolution ID");

        SDX.VoteType voteTypeBeforeChange = resolutions[_id].voteType;

        resolutions[_id].voteType = _voteType;

        emit ResolutionVoteTypeChanged(_id, voteTypeBeforeChange, _voteType);
    }
}