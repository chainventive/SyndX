// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../common/Base.sol";

// Interfaces imports
import "../meeting/IAGMeeting.sol";
import "../token/ISynToken.sol";

interface IVote {

    function startVoteSession(IAGMeeting _meeting, ISynToken synToken, uint256 _resolutionID, Enums.VoteType _voteType) external;
}