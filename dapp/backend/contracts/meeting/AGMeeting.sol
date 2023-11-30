// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Errors.sol";
import "../common/Constants.sol";

// Interfaces imports
import "../token/ISynToken.sol";
import "../meeting/IAGMeeting.sol";
import "../factory/SyndxFactory.sol";

contract AGMeeting is IAGMeeting, Ownable {

    // SyndxFactoryContract to consume services like getting a random number
    SyndxFactory syndxFactory;

    // Coproperty token contract
    // Used here to check if an address can sumbmit a resolution or an amendment
    ISynToken public token;

    Base.Resolution[] resolutions;
    Base.Amendment[] amendments;

    mapping(uint256 => mapping(address => bool)) hasVoted;

    uint256 creationTime;
    uint256 lockupTime;
    uint256 voteStartTime;
    uint256 voteEndTime;

    event ResolutionAdded(uint256 id, address author);

    event AmendementAdded(uint256 id, uint256 resolutionID, address author);

    modifier onlySyndxFactory {
        if (msg.sender != address(syndxFactory)) revert UnauthorizedContract();
        _;
    }

    modifier onlyCopropertyMembers {
        if (msg.sender != owner() && token.balanceOf(msg.sender) <= 0) revert CopropertyMemberExpected();
        _;
    }

    modifier onlyPropertyOwners {
        if (token.balanceOf(msg.sender) <= 0) revert Unauthorized('property owner');
        _;
    }

    modifier onlyBeforeResolutionLockup {
        if (block.timestamp > lockupTime) revert ResolutionAreNowLocked();
        _;
    }

    modifier onlyDuringVotingPeriod {
        if (block.timestamp < voteStartTime) revert VotingPeriodHasNotStarted();
        if (block.timestamp > voteEndTime) revert VotingPeriodHasEnded();
        _;
    }

    modifier onlyAfterVotingPeriod {
        if (block.timestamp < voteEndTime) revert VotingPeriodHasNotEnded();
        _;
    }

    // We let the AGMeeting contract under the syndic ownership that is the only allowed to create a meeting from the coproperty contract
    // We assume once the AGMeeting is created, property owners are allowed to submit resolutions and amendments
    constructor(SyndxFactory _syndxFactory, ISynToken _synToken, address _syndic, uint256 _votingStartTime) Ownable(_syndic) {

        if (address(_syndxFactory) == address(0)) revert MissingSyndxFactoryContract();
        if (address(_synToken) == address(0)) revert MissingTokenContract();

        token = _synToken;
        syndxFactory = _syndxFactory;

        _setMeetingTimeline(_votingStartTime);
    }

    function createResolution(string calldata _title, string calldata _description) external onlyCopropertyMembers onlyBeforeResolutionLockup returns (uint256) {
        
        return _createResolution(_title, _description, msg.sender);
    }

    function amendResolution(uint256 _resolutionID, string calldata _description) external onlyCopropertyMembers onlyBeforeResolutionLockup returns (uint256) {

        return _createAmendment(_resolutionID, _description, msg.sender);
    }

    function assignResolutionVoteType(uint256 _resolutionID, Enums.VoteType _voteType) external onlyOwner onlyBeforeResolutionLockup {

        _setResolutionVoteType(_resolutionID, _voteType);
    }

    function vote(uint256 _resolutionID, bool _approve) external onlyPropertyOwners /*onlyDuringVotingPeriod*/ {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        // Checks that the property owner hasn't already voted for this resolution;
        if (hasVoted[_resolutionID][msg.sender] == true) revert YouAlreadyVotedForThisResolution(_resolutionID);

        // Checks that the resolution have a voting type assignated
        if (resolutions[_resolutionID].voteType == Enums.VoteType.Undetermined) revert ResolutionVoteTypeNonAssignated(_resolutionID);

        // Get the voting power of the property owner
        uint256 shares = token.balanceOf(msg.sender);

        // Apply the voting choice
        if (_approve) {

            resolutions[_resolutionID].yesVotes += shares; // increase the weight of yes votes with the property owner voting power
        }
        else {

            resolutions[_resolutionID].noVotes += shares; // increase the weight of no votes with the property owner voting power
        }

        // Record that the user has voted for this resolution
        hasVoted[_resolutionID][msg.sender] == true;
    }

    // Once the voting period as ended, anybody can call tiebreack
    function tieBreak() public onlyAfterVotingPeriod {

        syndxFactory.requestRandomNumber();
    }

    function getVoteResult(uint256 _resolutionID) external view onlyAfterVotingPeriod returns(bool approved, uint256 yesCount, uint256 noCount, uint256 tiebreak) {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        if (resolutions[_resolutionID].voteType == Enums.VoteType.Undetermined) revert ResolutionVoteTypeNonAssignated(_resolutionID);

        uint256 no = resolutions[_resolutionID].noVotes;
        uint256 yes = resolutions[_resolutionID].yesVotes;
        uint256 noCount = resolutions[_resolutionID].noCount;
        uint256 yesCount = resolutions[_resolutionID].yesCount;

        if (resolutions[_resolutionID].voteType == Enums.VoteType.Unanimity) {
            
            // To be approved the resolution must receive 100% of yes vote
            return (yes == Constants.SYN_TOKEN_TOTAL_SUPPLY, yes, no, 0);
        }

        if (resolutions[_resolutionID].voteType == Enums.VoteType.SimpleMajority) {

            // Blank vote are ignored
            // To be approved the resolution must receive more yes votes than no votes
            // If nobody has voted we process the case as if it is an equality
            // If equality is found we use a random number provided by chainlink to determine if the resolution is approved or not
            if (yes == no) {

                // get the meeting random number
                uint256 tiebreakNumber = syndxFactory.getMeetingRandomNumber(address(this));
                if (tiebreakNumber <= 0) revert RandomNumberRequestNotFullfilled();

                // the resolution is approved if tiebreackNumber is odd (impair)
                return (tiebreakNumber % 2 == 1, yes, no, tiebreakNumber);
            }

            return (yes > no, yes, no, 0);
        }
        
        if (resolutions[_resolutionID].voteType == Enums.VoteType.AbsoluteMajority) {

            // Blank votes are excluded from the ballot. That impacts the majority threshold
            // To be approved the resolution must receive more yes votes than the majority threshold
            // If nobody has voted we process the case as if it is an equality
            if (yes == no) {
                
                // get the meeting random number
                uint256 tiebreakNumber = syndxFactory.getMeetingRandomNumber(address(this));
                if (tiebreakNumber <= 0) revert RandomNumberRequestNotFullfilled();

                // the resolution is approved if tiebreackNumber is odd (impair)
                return (tiebreakNumber % 2 == 1, yes, no, tiebreakNumber);
            }

            // To increase precision due to the fact that solidy do not manage float numbers we use a scale factor 
            // (we also checked that the max possible values calculated with this scale factor cannot exceed the uint256 max limit)
            uint256 factor    = 10000;
            uint256 scaledYes = yes * factor;
            uint256 scaledNo  = no  * factor;
            uint256 threshold = (scaledYes + scaledNo) / 2;

            return (scaledYes > threshold, yes, no, 0);
        }

        if (resolutions[_resolutionID].voteType == Enums.VoteType.DoubleMajority) {

            // Pour l'emporter le vote doit obtenir la majorité a la fois en terme de puissance de vote mais aussi en termes de nombre de votants

            if (yes == no && yesCount == noCount) {
                
                // get the meeting random number
                uint256 tiebreakNumber = syndxFactory.getMeetingRandomNumber(address(this));
                if (tiebreakNumber <= 0) revert RandomNumberRequestNotFullfilled();

                // the resolution is approved if tiebreackNumber is odd (impair)
                return (tiebreakNumber % 2 == 1, yes, no, tiebreakNumber);
            }

            uint256 factor = 10000;

            uint256 scaledYes = yes * factor;
            uint256 scaledNo = no  * factor;
            uint256 threshold1 = (scaledYes + scaledNo) / 2;

            uint256 scaledYesCount = yesCount * factor;
            uint256 scaledNoCount = noCount  * factor;
            uint256 threshold2 = (scaledYesCount + scaledNoCount) / 2;

            return (scaledYes > threshold1 && scaledYesCount > threshold2, yes, no, 0);
        }
        
        revert ResolutionVoteTypeIsUnknown(_resolutionID);
    }

    function getResolutionCount() external view returns(uint256) {

        return resolutions.length;
    }

    function getAmendementCount() external view returns(uint256) {

        return amendments.length;
    }

    function getResolution(uint256 _resolutionID) external view returns(Base.Resolution memory) {

        return resolutions[_resolutionID];
    }

    function getAmendment(uint256 _amendementID) external view returns(Base.Amendment memory) {

        return amendments[_amendementID];
    }

    function getMeetingTimeline() external view returns (uint256 created, uint256 lockup, uint256 voteStart, uint256 voteEnd) {

        return (creationTime, lockupTime, voteStartTime, voteEndTime);
    }

    function _createResolution(string calldata _title, string calldata _description, address _author) private onlyCopropertyMembers returns (uint256) {

        uint256 titleLen = bytes(_title).length;
        if (titleLen < Constants.TITLE_MIN_LENGHT || titleLen > Constants.TITLE_MAX_LENGHT) revert InvalidTitleLength();

        uint256 descriptionLen = bytes(_description).length;
        if (descriptionLen < Constants.DESCRIPTION_MIN_LENGHT || descriptionLen > Constants.DESCRIPTION_MAX_LENGHT) revert InvalidDescriptionLength();

        resolutions.push(Base.Resolution(_title, _description, _author, Enums.VoteType.Undetermined, 0, 0, 0, 0));

        uint256 resolutionID = resolutions.length - 1;

        emit ResolutionAdded(resolutionID, _author);

        return resolutionID;
    }

    function _createAmendment(uint256 _resolutionID, string calldata _description, address _author) private onlyCopropertyMembers returns (uint256) {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);

        uint256 descriptionLen = bytes(_description).length;
        if (descriptionLen < Constants.DESCRIPTION_MIN_LENGHT || descriptionLen > Constants.DESCRIPTION_MAX_LENGHT) revert InvalidDescriptionLength();
    
        amendments.push(Base.Amendment(_resolutionID, _description, _author));

        uint256 amendmentID = amendments.length - 1;

        emit AmendementAdded(amendmentID, _resolutionID, _author);

        return amendmentID;
    }

    function _setResolutionVoteType(uint256 _resolutionID, Enums.VoteType _voteType) private onlyOwner {

        if (_resolutionID >= resolutions.length) revert ResolutionNotFound(_resolutionID);
        if (_voteType == Enums.VoteType.Undetermined) revert ResolutionVoteTypeCannotBassignatedToUdetermined(_resolutionID);

        resolutions[_resolutionID].voteType = _voteType;
    }

    function _setMeetingTimeline(uint256 _voteStartTime) private {

        creationTime = block.timestamp;

        lockupTime = _voteStartTime - Constants.RESOLUTIONS_LOCKUP_DURATION;

        if (creationTime > lockupTime) revert ResolutionLockupTimeComeToEarly(creationTime, lockupTime, _voteStartTime);
        
        if (lockupTime - creationTime < Constants.MIN_DURATION_BEFORE_LOCKUP) revert ResolutionLockupTimeComeToEarly(creationTime, lockupTime, _voteStartTime);

        voteStartTime = _voteStartTime;

        voteEndTime = _voteStartTime + Constants.VOTE_SESSION_DURATION;
    }
}