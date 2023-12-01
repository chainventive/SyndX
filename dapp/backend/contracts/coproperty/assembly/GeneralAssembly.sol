// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../common/SDX.sol";
import "../../common/Validator.sol";

// Interfaces imports
import '../token/ICopropertyToken.sol';

// Contracts imports
import "../../Syndx.sol";
import "../Coproperty.sol";

contract GeneralAssembly is Validator, Ownable {

    // The syndx contract
    Syndx private syndx;

    // The syndic account in charge of this general assembly
    address syndic;

    // The governance token of the coproperty
    ICopropertyToken governanceToken;

    // The unique random number provided by the syndx contract if asked by this contract
    uint256 public tiebreaker;

    // The general assembly timeline
    uint256 public created;     // When the general assembly was created
    uint256 public lockup;      // Resolution and amendements cannot be created after this time
    uint256 public voteStart;   // When the voting session starts
    uint256 public voteEnd;     // When the voting session ends

    // The resolutions to be voted
    SDX.Resolution[] resolutions;

    // The amendments committed to resolutions
    SDX.Amendment[] amendments;

    // Keep track of who has voted for each resolution
    mapping (uint256 => mapping (address => bool)) hasVoted;

    // Emmitted when a new resolution is created
    event ResolutionCreated(uint256 id, address author);

    // Emmitted when a new amendment is created
    event AmendmentCreated(uint256 id, uint256 resolutionID, address author);

    // Emitted when a resolution vote type has changed
    event ResolutionVoteTypeChanged(uint256 id, SDX.VoteType typeBefore, SDX.VoteType typeAfter);

    // Emmitted when a new vote is submitted
    event Voted (address author, uint256 resolutionID, bool approved);

    // Emmitted when a tiebreaker request is sent
    event TiebreakerRequestSent (uint256 blocktime);

    // Emmitted when the tiebreaker is successfully fetched
    event TiebreakerFullfilled (uint256 tiebreaker);

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

    // Ensure that the caller is a coproperty governance token holder
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

    // Vote for a resolution
    function vote(uint256 _resolutionID, bool _approve) external onlyCopropertyMembers onlyDuringVotingSession {

        if (_resolutionID >= resolutions.length) revert ("Unknown resolution ID");
        if (hasVoted[_resolutionID][msg.sender] == true) revert ("You already voted for this resolution");
        if (resolutions[_resolutionID].voteType == SDX.VoteType.Undefined) revert ("Resolution vote type undetermined");

        // Get the voting power of the property owner
        uint256 propertyShares = governanceToken.balanceOf(msg.sender);

        if (_approve) {

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

        emit Voted (msg.sender, _resolutionID, _approve);
    }

    // Request for a tibreaker number
    // As requesting a tiebreaker number my incur costs (ex: with chainlink VRF randmness startegy) we rstrict the use of this function to the coproperty memebers
    function requestTiebreaker() public onlyAfterVotingSession onlyCopropertyMembers {

        syndx.requestRandomNumber();

        emit TiebreakerRequestSent(block.timestamp);
    }

    // Callback function to allow the syndx contract to provide the requested tiebreak number
    // We protect the contract against tiebreaker overwrites. This mean once the tiebreak number is set, it is forever
    function fullfillTiebreaker(uint256 _tiebreaker) public onlyOwner {

        if (tiebreaker > 0) revert ("Tiebreaker already fullfilled");
        if (_tiebreaker <= 0) revert ("Provided tiebreaker cannot be zero");

        tiebreaker = _tiebreaker;

        emit TiebreakerFullfilled (tiebreaker);
    }

    // Get the vote result of a given resolution
    // Every body can request vote results once the voting session has ended
    function getVoteResult(uint256 _resolutionID) external view onlyAfterVotingSession returns (SDX.VoteResult memory) {
        
        if (_resolutionID >= resolutions.length) revert ("Unknown resolution ID");

        // Prepare an empty vote result that will be filled according to the resolution vote type
        SDX.VoteResult memory voteResult;

        // Retrieve the resolution to tally
        SDX.Resolution memory resolution = resolutions[_resolutionID];

        // Tally
        if (resolution.voteType == SDX.VoteType.Undefined) {

            revert ("Resolution with an undefined vote type are not part of voting sesssion");
        }
        else if (resolution.voteType == SDX.VoteType.Unanimity) {

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
        else {
            
            revert ("Unexpected error: vote type tally not implemented");
        }

        // Tiebreak equality if there is and if the tiebreaker number is available
        if (voteResult.equality) voteResult = _tiebreakVoteResult(voteResult);

        return voteResult;
    }

    // Tally a given resolution votes according to the 'Unanimity' rules
    // All property owner are taken into account (included the ones that have not voted)
    // To be approved a resolution must get the approval of all property share owners
    function _unanimityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {

        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        voteResult.approved = _resolution.yesShares == PROPERTY_SHARES_MAX_SUPPLY;

        return voteResult;
    }

    // Tally a given resolution votes according to the 'SimpleMajority' rules
    // Blank votes does not impacts the final result
    // To be approved a resolution must receive more yes vote shares than no vote shares
    function _simpleMajorityTally(uint256 _resolutionID, SDX.Resolution memory _resolution) private pure returns (SDX.VoteResult memory) {

        SDX.VoteResult memory voteResult = SDX.createUntalliedVoteResult(_resolutionID, _resolution);

        // Verify equality
        voteResult.equality = (voteResult.yesShares == voteResult.noShares);
        if (voteResult.equality) return voteResult;

        voteResult.approved = _resolution.yesShares > _resolution.noShares;

        return voteResult;
    }

    // Tally a given resolution votes according to the 'AbsoluteMajority' rules
    // Blank votes impacts the result because they have an effect on the required thresold to obtains the majority
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

    // Tally a given resolution votes according to the 'DoubleMajority' rules
    // Blank votes impacts the result because they have an effect on the required thresolds to obtains both majorities
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

        // The amount of yes vote count to be exceeded to gain the first majority
        uint256 threshold2 = (scaledYesCount + scaledNoCount) / 2;

        voteResult.approved = (scaledYesShares > threshold1 && scaledYesCount > threshold2);

        return voteResult;
    }

    // function tie break equality with a random number
    function _tiebreakVoteResult (SDX.VoteResult memory _voteResult) private view returns (SDX.VoteResult memory) {

        // If the tiebreaker number is not already fectched from the syndx contract, we try to request it
        // Note: Syndx contract manage to ensure that there will be one and only one unique random number request for each general assembly contract
        //       This means that if we accidentally fetch the random number twice, it will always be the same
        if (tiebreaker <= 0) revert ("Tiebreaker request not fullfilled yet");

        // To tie braek we just checks random tiebreaker number is odd or even 
        _voteResult.tiebreaker = tiebreaker;
        _voteResult.approved = tiebreaker % 2 == 1;

        return _voteResult;
    }
}