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

contract AGMeeting is IAGMeeting, Ownable {

    // Coproperty token contract
    // Used here to check if an address can sumbmit a resolution or an amendment
    ISynToken public token;

    Base.Resolution[] resolutions;
    Base.Amendment[] amendments;

    mapping(uint256 => mapping(address => bool)) hasVoted;

    uint256 creationTimestamp;
    uint256 resolutionLockupTime;
    uint256 votingPeriodStartTime;
    uint256 votingPeriodEndTime;

    // VOIR POUR GERER LES EGALITES AVEC CHAINLINK EN PRENANT UN NOMBRE ALEATOIRE A LA FIN DE LA SESSION DE VOTE
    // FAIRE UNE FONCTION DEDIE APPELLE PAR LE SYNDIC APRES LA FIN DES VOTES ET STOCKEE DANS LETAT DU CONTRAT PUIS UTILISER PAR GET VOTE RESULT
    uint256 random;

    event ResolutionAdded(uint256 id, address author);

    event AmendementAdded(uint256 id, uint256 resolutionID, address author);

    modifier onlyCopropertyMembers {
        if (msg.sender != owner() && token.balanceOf(msg.sender) <= 0) revert CopropertyMemberExpected();
        _;
    }

    modifier onlyPropertyOwners {
        if (token.balanceOf(msg.sender) <= 0) revert Unauthorized('property owner');
        _;
    }

    modifier onlyBeforeResolutionLockup {
        if (block.timestamp > resolutionLockupTime) revert ResolutionAreNowLocked();
        _;
    }

    modifier onlyDuringVotingPeriod {
        if (block.timestamp < votingPeriodStartTime) revert VotingPeriodHasNotStarted();
        if (block.timestamp > votingPeriodEndTime) revert VotingPeriodHasEnded();
        _;
    }

    modifier onlyAfterVotingPeriod {
        if (block.timestamp < votingPeriodEndTime) revert VotingPeriodHasNotEnded();
        _;
    }

    // We let the AGMeeting contract under the syndic ownership that is the only allowed to create a meeting from the coproperty contract
    // We assume once the AGMeeting is created, property owners are allowed to submit resolutions and amendments
    constructor(ISynToken _synToken, address _syndic, uint256 _votingStartTime) Ownable(_syndic) {

        if (address(_synToken) == address(0)) revert MissingTokenContract();

        token = _synToken;

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

    function vote(uint256 _resolutionID, bool _approve) external onlyPropertyOwners onlyDuringVotingPeriod {

        if (_resolutionID > resolutions.length) revert ResolutionNotFound(_resolutionID);

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
    }

    function tieBreak() external onlyAfterVotingPeriod onlyOwner {

        // set the random number with chainlink oracle here !
    }

    function getVoteResult(uint256 _resolutionID) external onlyAfterVotingPeriod returns(bool) {

        if (_resolutionID > resolutions.length) revert ResolutionNotFound(_resolutionID);

        if (resolutions[_resolutionID].voteType == Enums.VoteType.Undetermined) revert ResolutionVoteTypeNonAssignated(_resolutionID);

        uint256 no = resolutions[_resolutionID].noVotes;
        uint256 yes = resolutions[_resolutionID].yesVotes;
        uint256 blank = Constants.SYN_TOKEN_TOTAL_SUPPLY - (yes + no);

        if (resolutions[_resolutionID].voteType == Enums.VoteType.Unanimity) {

            bool approved = resolutions[_resolutionID].yesVotes == Constants.SYN_TOKEN_TOTAL_SUPPLY;
            return approved;
        }

        if (resolutions[_resolutionID].voteType == Enums.VoteType.SimpleMajority) {

            // pour gérer les égalitées random doit être > 0
            bool approved = true;
            return true;
        }

        if (resolutions[_resolutionID].voteType == Enums.VoteType.AbsoluteMajority) {

            // pour gérer les égalitées random doit être > 0
            bool approved = true;
            return true;
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

        return (creationTimestamp, resolutionLockupTime, votingPeriodStartTime, votingPeriodEndTime);
    }

    function _createResolution(string calldata _title, string calldata _description, address _author) private onlyCopropertyMembers returns (uint256) {

        uint256 titleLen = bytes(_title).length;
        if (titleLen < Constants.TITLE_MIN_LENGHT || titleLen > Constants.TITLE_MAX_LENGHT) revert InvalidTitleLength();

        uint256 descriptionLen = bytes(_description).length;
        if (descriptionLen < Constants.DESCRIPTION_MIN_LENGHT || descriptionLen > Constants.DESCRIPTION_MAX_LENGHT) revert InvalidDescriptionLength();

        resolutions.push(Base.Resolution(_title, _description, _author, Enums.VoteType.Undetermined, 0, 0));

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

        resolutions[_resolutionID].voteType = _voteType;
    }

    function _setMeetingTimeline(uint256 _votingStartTime) private {

        creationTimestamp = block.timestamp;

        resolutionLockupTime = _votingStartTime - Constants.RESOLUTIONS_LOCKUP_DURATION;

        if (creationTimestamp > resolutionLockupTime) revert ResolutionLockupTimeComeToEarly(_votingStartTime, resolutionLockupTime, Constants.MIN_DURATION_BEFORE_LOCKUP);
        if (resolutionLockupTime - creationTimestamp < Constants.MIN_DURATION_BEFORE_LOCKUP) revert ResolutionLockupTimeComeToEarly(_votingStartTime, resolutionLockupTime, Constants.MIN_DURATION_BEFORE_LOCKUP);

        votingPeriodStartTime = _votingStartTime;

        votingPeriodEndTime = _votingStartTime + Constants.VOTE_SESSION_DURATION;
    }
}