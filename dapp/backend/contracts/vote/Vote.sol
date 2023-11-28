// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Base.sol";
import "../common/Enums.sol";
import "../common/Errors.sol";
import "../common/Constants.sol";

// Interfaces imports
import "./IVote.sol";
import "../token/ISynToken.sol";

contract Vote is IVote, Ownable {

    IAGMeeting meeting;

    uint256 currentVoteSessionID;

    mapping(uint256 => Base.VoteSession) voteSessions;

    // The syndic should not be allowed to owner a vote contract ?
    // Ce contrat de vote est deployé au rythme de 1 contrat de vote par meeting (assemblée générale) (that prevent resolutionID collision)
    constructor() Ownable (msg.sender) {}

    // Here the mineur can deliberately delay the publication of the block to prevent a vote to be taken into account
    // To mitigate risk users will be incentivized to perform their votes five minutes before the expiry date
    // Given our use case, the chance of a miner launching a front-running attack on a vote is very low, if not nonexistent
    function startVoteSession(IAGMeeting _meeting, ISynToken synToken, uint256 _resolutionID, Enums.VoteType _voteType) external onlyOwner {

        _setMeetingAddress(_meeting);
        _increaseCurrentVoteSessionID();
        _startCurrentVoteSession(_resolutionID, _voteType);
    }

    // Set the meeting contract address tied to this vote contract
    function _setMeetingAddress(IAGMeeting _meeting) private {

        if (address(_meeting) == address(0)) revert AddressZeroUnauthorized();

        meeting = _meeting;
    }

    // The current voting session id will be increased if and only if it point to an already used voting session. Otherwise it will do nothing.
    function _increaseCurrentVoteSessionID() private onlyOwner {
        
        if (
              voteSessions[currentVoteSessionID].alreadyUsed // if the current session has been already used
           && block.timestamp > voteSessions[currentVoteSessionID].expiryTimestamp // and if this current session has also ended
        ){
            currentVoteSessionID += 1; // we can launch a new vote session. otherwise, NO !
        }
    }

    // The current voting session will be started if and only if it was not already used
    // Voir si ajout d'un controle pour verifier aupres du contrat de meeting que le resolutionID et l'address du contract de meeting est valide ???
    function _startCurrentVoteSession(uint256 _resolutionID, Enums.VoteType _voteType) private onlyOwner {

        if (_voteType == Enums.VoteType.Undetermined) revert UndeterminedVoteType();
        if (voteSessions[currentVoteSessionID].alreadyUsed) revert CurrentVoteSessionAlreadyUsed();

        voteSessions[currentVoteSessionID].alreadyUsed = true;
        voteSessions[currentVoteSessionID].voteType = _voteType;
        voteSessions[currentVoteSessionID].resolutionID = _resolutionID;
        voteSessions[currentVoteSessionID].expiryTimestamp = block.timestamp + Constants.VOTE_SESSION_DURATION;
    }
}