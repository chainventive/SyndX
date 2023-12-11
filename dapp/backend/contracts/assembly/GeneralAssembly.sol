// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../_common/SDX.sol";
import "../_common/constants.sol";
import "../_common/errors/coproperty.sol";

// Interfaces imports
import './IGeneralAssembly.sol';
import '../tokens/vote/IVoteToken.sol';
import '../tokens/governance/IGovernanceToken.sol';

// Contracts imports
import "../ISyndx.sol";

/// @title General Assembly Contract for Syndx Co-Property Management
/// @notice This contract manages the general assembly processes for a co-property, including creating and voting on resolutions and amendments.
/// @dev Inherits from IGeneralAssembly, Validator, and Ownable to manage assembly timelines, resolutions, and access control.
contract GeneralAssembly is IGeneralAssembly, Ownable {

    /// @notice Address of the Syndx contract
    ISyndx private syndx;

    /// @notice Address of the syndic in charge of this general assembly
    address public syndic;

    /// @notice Governance token associated with the coproperty
    IGovernanceToken public governanceToken;

    /// @notice Vote token associated with the coproperty
    IVoteToken public voteToken;

    /// @notice Unique random number provided by Syndx, if requested
    uint256 public tiebreaker;

    /// @notice When the general assembly was created
    uint256 public created;    

    /// @notice Resolution and amendements cannot be created after this time
    uint256 public lockup;  

    /// @notice When the voting session starts
    uint256 public voteStart;  

    /// @notice When the voting session ends
    uint256 public voteEnd;     

    /// @notice The resolutions to be voted
    SDX.Resolution[] private resolutions;

    /// @notice The amendments committed to resolutions
    SDX.Amendment[] private amendments;

    /// @notice Keep track of who has voted for each resolution
    mapping (uint256 => mapping (address => bool)) public hasVoted;

    /// @notice Emitted when a new resolution is created
    event ResolutionCreated(uint256 id, address author);

    /// @notice Emitted when a new amendment is created
    event AmendmentCreated(uint256 id, uint256 resolutionID, address author);

    /// @notice Emitted when a resolution vote type is changed
    event ResolutionVoteTypeSet(uint256 id, SDX.VoteType previousType, SDX.VoteType newType);

    /// @notice Emitted when a new vote is cast
    event VoteCast (address author, uint256 resolutionID, bool ballotChoice);

    /// @notice Emitted when a tiebreaker request is sent
    event TiebreakerRequested (uint256 blocktime);

    /// @notice Emitted when the tiebreaker number is successfully fetched
    event TiebreakerFulfilled (uint256 tiebreaker);

    /// @notice Modifier to ensure that the caller is the coproperty syndic
    modifier onlyCopropertySyndic {
        if (msg.sender != syndic) revert NotCopropertySyndic(msg.sender);
        _;
    }

    /// @notice Modifier to ensure that the caller is a member of the coproperty
    modifier onlyCopropertyMembers {
        if (msg.sender != syndic && governanceToken.balanceOf(msg.sender) <= 0) revert NotCopropertyMember(msg.sender);
        _;
    }

    /// @notice Modifier to ensure that the caller owns vote tokens
    modifier onlyVoteTokenOwner {
        if (voteToken.balanceOf(msg.sender) <= 0) revert NotPropertySharesOwner(msg.sender);
        _;
    }

    /// @notice Modifier to ensure that the call is made before the start of the lockup period
    modifier onlyBeforeLockup {
        if (block.timestamp > lockup) revert LockupAlreadyStarted(block.timestamp, lockup);
        _;
    }

    /// @notice Modifier to ensure that the call is made during the voting session
    modifier onlyDuringVotingSession {
        if (block.timestamp < voteStart) revert VotingSessionNotStartedYet (block.timestamp, voteStart);
        if (block.timestamp > voteEnd) revert VotingSessionAlreadyEnded (block.timestamp, voteEnd);
        _;
    }

    /// @notice Modifier to ensure that the call is made after the voting session has ended
    modifier onlyAfterVotingSession {
        if (block.timestamp < voteEnd) revert VotingSessionNotEndedYet (block.timestamp, voteEnd);
        _;
    }

    /// @notice Constructor for the General Assembly contract
    /// @dev Sets up the general assembly with the provided parameters and initial timeline
    /// @param _syndx Address of the Syndx contract
    /// @param _syndic Address of the syndic in charge
    /// @param _governanceTokenAddress Address of the governance token
    /// @param _voteTokenAddress Address of the vote token
    /// @param _voteStartTime Start time for the vote
    constructor(ISyndx _syndx, address _syndic, address _governanceTokenAddress, address _voteTokenAddress, uint256 _voteStartTime) Ownable(msg.sender) {

        syndx = _syndx;
        syndic = _syndic;
        voteToken = IVoteToken(_voteTokenAddress);
        governanceToken = IGovernanceToken(_governanceTokenAddress);

        _setTimeline(_voteStartTime);
    }

    /// @notice Sets the timeline for the general assembly based on the expected voting start time
    /// @dev Private function to initialize and calculate the timeline of the general assembly
    /// @param _voteStartTime The expected start time for voting
    function _setTimeline(uint256 _voteStartTime) private {

        // When the general assembly is created
        created = block.timestamp;

        // Calculated lockup time according to the expected vote start time
        lockup = _voteStartTime - GENERAL_ASSEMBLY_LOCKUP_DURATION;

        // If the calculated lockup time occurs after the general assembly calculation we revert
        if (created > lockup) revert TooEarlyLockupTime(created, GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP, lockup, _voteStartTime);
        
        // If the timespan between the creation time and the start of the lockup is to short we revert cause we havent enought time to handle resolution submission and a safe enough lockup period
        if (lockup - created < GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP) revert TooEarlyLockupTime(created, GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP, lockup, _voteStartTime);

        // Set the vote start time
        voteStart = _voteStartTime;

        // Calculate the vote end time
        voteEnd = _voteStartTime + GENERAL_ASSEMBLY_VOTING_SESSION_DURATION;
    }

    /// @notice Retrieves the timeline of the general assembly
    /// @return The timeline of the general assembly, including creation, lockup, vote start, and vote end times
    function getTimeline() external view returns (SDX.GeneralAssemblyTimeline memory) {

        return SDX.GeneralAssemblyTimeline(created, lockup, voteStart, voteEnd);
    }

    /// @notice Retrieves the lockup time of the general assembly
    /// @return The lockup time of the general assembly
    function getLockupTime() external view returns (uint256) {

        return lockup;
    }

    /// @notice Creates a new resolution for the general assembly
    /// @dev Emits a ResolutionCreated event upon success
    /// @param _title The title of the resolution
    /// @param _description The detailed description of the resolution
    /// @return The ID of the newly created resolution
    function createResolution(string calldata _title, string calldata _description) external onlyCopropertyMembers onlyBeforeLockup returns (uint256) {

        if (bytes(_title).length < TITLE_MIN_LENGHT) revert TitleTooShort ();
        if (bytes(_title).length > TITLE_MAX_LENGHT) revert TitleTooLong ();

        if (bytes(_description).length < DESCRIPTION_MIN_LENGHT) revert DescriptionTooShort();
        if (bytes(_description).length > DESCRIPTION_MAX_LENGHT) revert DescriptionTooLong();

        SDX.Resolution memory resolution = SDX.createResolution(_title, _description, msg.sender);

        resolutions.push(resolution);

        uint256 resolutionID = resolutions.length - 1;

        emit ResolutionCreated(resolutionID, msg.sender);

        return resolutionID;
    }

    /// @notice Creates a new amendment to a resolution
    /// @dev Emits an AmendmentCreated event upon successful creation
    /// @param _resolutionID ID of the resolution to which the amendment is being added
    /// @param _description Detailed description of the amendment
    /// @return ID of the newly created amendment
    function createAmendment(uint256 _resolutionID, string calldata _description) external onlyCopropertyMembers onlyBeforeLockup returns (uint256)  {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        if (bytes(_description).length < DESCRIPTION_MIN_LENGHT) revert DescriptionTooShort();
        if (bytes(_description).length > DESCRIPTION_MAX_LENGHT) revert DescriptionTooLong();

        SDX.Amendment memory amendement = SDX.createAmendment(_resolutionID, _description, msg.sender);

        amendments.push(amendement);

        uint256 amendmentID = amendments.length - 1;

        emit AmendmentCreated(amendmentID, _resolutionID, msg.sender);

        return amendmentID;
    }

    /// @notice Retrieves the total number of resolutions in the general assembly
    /// @return Total number of resolutions
    function getResolutionCount() external view returns (uint256) {
        return resolutions.length;
    }

    /// @notice Retrieves a specific resolution by its ID
    /// @param _id ID of the resolution to retrieve
    /// @return The requested resolution
    function getResolution(uint256 _id) external view returns (SDX.Resolution memory) {
        
        if (_id >= resolutions.length) revert ResolutionNotFound(_id);

        return resolutions[_id];
    }

    /// @notice Retrieves the total number of amendments in the general assembly
    /// @return Total number of amendments
    function getAmendmentCount() external view returns (uint256) {
        return amendments.length;
    }

    /// @notice Retrieves a specific amendment by its ID
    /// @param _id ID of the amendment to retrieve
    /// @return The requested amendment
    function getAmendment(uint256 _id) external view returns (SDX.Amendment memory) {
        
        if (_id >= amendments.length) revert AmendmentNotFound(_id);

        return amendments[_id];
    }

    /// @notice Sets the vote type for a specific resolution
    /// @dev Can only be called by the coproperty syndic and before the lockup period
    /// @param _id ID of the resolution for which to set the vote type
    /// @param _voteType The vote type to be set for the resolution
    function setResolutionVoteType(uint256 _id, SDX.VoteType _voteType) external onlyCopropertySyndic onlyBeforeLockup {

        if (_id >= resolutions.length) revert ResolutionNotFound(_id);

        if (_voteType == SDX.VoteType.Undefined) revert CannotSetResolutionVoteTypeToUndefined(_id);

        SDX.VoteType voteTypeBeforeChange = resolutions[_id].voteType;

        resolutions[_id].voteType = _voteType;

        emit ResolutionVoteTypeSet(_id, voteTypeBeforeChange, _voteType);
    }

    /// @notice Casts a vote for a specific resolution
    /// @dev Requires the caller to be a property shares owner and within the voting session time frame
    /// @param _resolutionID The ID of the resolution to vote on
    /// @param _ballotChoice Boolean indicating approval (true) or disapproval (false) of the resolution
    function vote(uint256 _resolutionID, bool _ballotChoice) external onlyVoteTokenOwner onlyDuringVotingSession {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);
        if (hasVoted[_resolutionID][msg.sender] == true) revert AlreadyVotedForResolution(_resolutionID, msg.sender);
        if (resolutions[_resolutionID].voteType == SDX.VoteType.Undefined) revert CannotVoteForResolutionWithUndefinedVoteType(_resolutionID);

        // Get the voting power of the property owner
        uint32 propertyShares = uint32(voteToken.balanceOf(msg.sender));

        if (_ballotChoice) {

            // Increase the weight of YES votes with the property owner voting power
            resolutions[_resolutionID].yesShares += propertyShares;

            // Increase the counter of YES votes
            resolutions[_resolutionID].yesCount += 1;
        }
        else {

            // Increase the weight of the NO votes with the property owner voting power
            resolutions[_resolutionID].noShares += propertyShares;

            // Increase the counter of NO votes
            resolutions[_resolutionID].noCount += 1;
        }

        hasVoted[_resolutionID][msg.sender] = true;

        emit VoteCast (msg.sender, _resolutionID, _ballotChoice);
    }

    /// @notice Requests a tiebreaker number for resolving vote ties
    /// @dev Can only be called by coproperty members after the voting session
    function requestTiebreaker() public onlyAfterVotingSession onlyCopropertyMembers {

        syndx.requestRandomNumber();

        emit TiebreakerRequested(block.timestamp);
    }

    /// @notice Allows the Syndx contract to provide a requested tiebreaker number
    /// @dev Can only be called by the contract owner; protects against overwriting an existing tiebreaker
    /// @param _tiebreaker The tiebreaker number provided
    function fulfillTiebreaker(uint256 _tiebreaker) external onlyOwner {

        if (tiebreaker > 0) revert TiebreakerAlreadyFulfilled();
        if (_tiebreaker <= 0) revert TiebreakerCannotBeFulfilledWithZero();

        tiebreaker = _tiebreaker;

        emit TiebreakerFulfilled (tiebreaker);
    }

    /// @notice Retrieves the vote result for a specific resolution
    /// @dev Can be called by anyone after the voting session
    /// @param _resolutionID ID of the resolution for which to retrieve the vote result
    /// @return The result of the vote on the specified resolution
    function getVoteResult(uint256 _resolutionID) external view onlyAfterVotingSession returns (SDX.VoteResult memory) {
        
        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        // Prepare an empty vote result that will be filled according to the resolution vote type
        SDX.VoteResult memory voteResult;

        // Retrieve the resolution to tally
        SDX.Resolution memory resolution = resolutions[_resolutionID];

        // Tally

        if (resolution.voteType == SDX.VoteType.Unanimity) {

            voteResult = _unanimityTally(_resolutionID, resolution);
        }
        else if (resolution.voteType == SDX.VoteType.SimpleMajority) {

            voteResult = _simpleMajorityTally(_resolutionID, resolution);
        }
        else if (resolution.voteType == SDX.VoteType.AbsoluteMajority) {

            voteResult = _absoluteMajorityTally(_resolutionID, resolution);
        }
        else if (resolution.voteType == SDX.VoteType.DoubleMajority) {

            voteResult = _doubleMajorityTally(_resolutionID, resolution);
        }

        // Tiebreak equality if there is and if the tiebreaker number is available
        if (voteResult.equality) voteResult = _tiebreakVoteResult(voteResult);

        return voteResult;
    }

    /// @notice Tally the votes for a given resolution according to 'Unanimity' rules.
    /// @notice All property owners are considered, including those who have not voted.
    /// @notice For a resolution to be approved, it must receive the approval of all property share owners.
    /// @param _resolutionID The ID of the resolution being tallied.
    /// @param _resolution The resolution object containing voting details.
    /// @return voteResult The result of the vote tallying.
    function _unanimityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {

        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        voteResult.approved = _resolution.yesShares == PROPERTY_SHARES_MAX_SUPPLY;

        return voteResult;
    }

    /// @notice Tally the votes for a given resolution according to 'Simple Majority' rules.
    /// @notice Blank votes do not impact the final result.
    /// @notice For a resolution to be approved, it must receive more 'yes' vote shares than 'no' vote shares.
    /// @param _resolutionID The ID of the resolution being tallied.
    /// @param _resolution The resolution object containing voting details.
    /// @return voteResult The result of the vote tallying, including information about any equality in votes.
    function _simpleMajorityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {

        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        // Verify equality
        voteResult.equality = (voteResult.yesShares == voteResult.noShares);
        if (voteResult.equality) return voteResult;

        voteResult.approved = _resolution.yesShares > _resolution.noShares;

        return voteResult;
    }

    /// @notice Tally the votes for a given resolution according to 'Absolute Majority' rules.
    /// @notice Blank votes impact the result by affecting the required threshold to achieve a majority.
    /// @param _resolutionID The ID of the resolution being tallied.
    /// @param _resolution The resolution object containing voting details.
    /// @return voteResult The result of the vote tallying, including information about any equality in votes.
    function _absoluteMajorityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {
        
        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        // Verify equality
        voteResult.equality = (voteResult.yesShares == voteResult.noShares);
        if (voteResult.equality) return voteResult;

        // Limit risks caused by a floating point threshold
        uint256 factor = PROPERTY_SHARES_MAX_SUPPLY <= 10000 ? PROPERTY_SHARES_MAX_SUPPLY : 10000;
        uint256 scaledYesShares = voteResult.yesShares * factor;
        uint256 scaledNoShares = voteResult.noShares * factor;

        // The amount of property shares to be exceeded to gain the majority
        uint256 threshold = (scaledYesShares + scaledNoShares) / 2;
        
        voteResult.approved = (voteResult.yesShares * factor) > threshold;

        return voteResult;
    }

    /// @notice Tally the votes for a given resolution according to 'Double Majority' rules.
    /// @notice Blank votes impact the result by affecting the required thresholds to achieve both majorities.
    /// @param _resolutionID The ID of the resolution being tallied.
    /// @param _resolution The resolution object containing voting details.
    /// @return voteResult The result of the vote tallying, including information about any equality in votes.
    function _doubleMajorityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {

        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        // Verify equality
        voteResult.equality = (voteResult.yesShares == voteResult.noShares) && (voteResult.yesCount == voteResult.noCount);
        if (voteResult.equality) return voteResult;
        
        // Limit risks caused by a floating point threshold
        uint256 factor = PROPERTY_SHARES_MAX_SUPPLY <= 10000 ? PROPERTY_SHARES_MAX_SUPPLY : 10000;
        uint256 scaledYesShares = voteResult.yesShares * factor;
        uint256 scaledNoShares  = voteResult.noShares  * factor;
        uint256 scaledYesCount  = voteResult.yesCount * factor;
        uint256 scaledNoCount   = voteResult.noCount  * factor;

        // The amount of property shares to be be exceeded to gain the first majority
        uint256 threshold1 = (scaledYesShares + scaledNoShares) / 2;

        // The amount of yes vote count to be exceeded to gain the second majority
        uint256 threshold2 = (scaledYesCount + scaledNoCount) / 2;

        voteResult.approved = (scaledYesShares > threshold1) && (scaledYesCount > threshold2);

        return voteResult;
    }

    /// @notice Function to break vote result equality using a random number.
    /// @dev This function uses a tiebreaker number to resolve vote ties.
    /// @param _voteResult The vote result object that may contain an equality needing resolution.
    /// @return The updated vote result, with the tie resolved using the tiebreaker number.
    function _tiebreakVoteResult (SDX.VoteResult memory _voteResult) private view returns (SDX.VoteResult memory) {

        // If the tiebreaker number is not already fectched from the syndx contract, we try to request it
        // Note: Syndx contract manage to ensure that there will be one and only one unique random number request for each general assembly contract
        //       This means that if we accidentally fetch the random number twice, it will always be the same
        if (tiebreaker <= 0) revert TiebreakerRequestNotFulfilled();

        // To tie braek we just checks random tiebreaker number is odd or even 
        _voteResult.tiebreaker = tiebreaker;
        _voteResult.approved = tiebreaker % 2 == 1;

        return _voteResult;
    }
}