// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../SDX.sol";

error NotCopropertySyndic (address caller);
error NoGeneralAssemblyFound ();
error NotCopropertyMember (address caller);
error NotPropertySharesOwner (address caller);
error LockupAlreadyStarted (uint256 currentTime, uint256 lockupTime);
error VotingSessionNotStartedYet (uint256 currentTime, uint256 voteStartTime);
error VotingSessionAlreadyEnded (uint256 currentTime, uint256 voteEndTime);
error VotingSessionNotEndedYet (uint256 currentTime, uint256 voteEndTime);
error TooEarlyLockupTime(uint256 currentTime, uint256 minLockupDuration, uint256 calculatedLockupTime, uint256 targetVoteStartTime);
error ResolutionNotFound (uint256 id);
error AmendmentNotFound (uint256 id);
error CannotSetResolutionVoteTypeToUndefined (uint256 resolutionId);
error AlreadyVotedForResolution (uint256 resolutionId, address voter);
error CannotVoteForResolutionWithUndefinedVoteType (uint256 resolutionId);
error TiebreakerAlreadyFulfilled ();
error TiebreakerRequestNotFulfilled ();
error TiebreakerCannotBeFulfilledWithZero ();
error TitleTooShort ();
error TitleTooLong ();
error DescriptionTooShort ();
error DescriptionTooLong ();
error CopropertyNameTooShort ();
error CopropertyNameTooLong ();