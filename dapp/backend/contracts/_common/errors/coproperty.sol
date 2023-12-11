// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../SDX.sol";

/* Custom errors for Syndx Co-Property Management System */

/// @notice Error indicating that the caller is not the syndic of the co-property.
/// @param caller The address of the caller.
error NotCopropertySyndic (address caller);

/// @notice Error indicating that no general assembly was found.
error NoGeneralAssemblyFound ();

/// @notice Error indicating that the caller is not a member of the co-property.
/// @param caller The address of the caller.
error NotCopropertyMember (address caller);

/// @notice Error indicating that the caller does not own property shares.
/// @param caller The address of the caller.
error NotPropertySharesOwner (address caller);

/// @notice Error indicating that the lockup period has already started.
/// @param currentTime The current time.
/// @param lockupTime The time when lockup started.
error LockupAlreadyStarted (uint256 currentTime, uint256 lockupTime);

/// @notice Error indicating that the voting session has not started yet.
/// @param currentTime The current time.
/// @param voteStartTime The start time of the voting session.
error VotingSessionNotStartedYet (uint256 currentTime, uint256 voteStartTime);

/// @notice Error indicating that the voting session has already ended.
/// @param currentTime The current time.
/// @param voteEndTime The end time of the voting session.
error VotingSessionAlreadyEnded (uint256 currentTime, uint256 voteEndTime);

/// @notice Error indicating that the voting session has not ended yet.
/// @param currentTime The current time.
/// @param voteEndTime The end time of the voting session.
error VotingSessionNotEndedYet (uint256 currentTime, uint256 voteEndTime);

/// @notice Error indicating that the calculated lockup time is too early.
/// @param currentTime The current time.
/// @param minLockupDuration The minimum lockup duration.
/// @param calculatedLockupTime The calculated lockup time.
/// @param targetVoteStartTime The target start time for voting.
error TooEarlyLockupTime(uint256 currentTime, uint256 minLockupDuration, uint256 calculatedLockupTime, uint256 targetVoteStartTime);

/// @notice Error indicating that a resolution was not found.
/// @param id The ID of the resolution.
error ResolutionNotFound (uint256 id);

/// @notice Error indicating that an amendment was not found.
/// @param id The ID of the amendment.
error AmendmentNotFound (uint256 id);

/// @notice Error indicating that a resolution vote type cannot be set to undefined.
/// @param resolutionId The ID of the resolution.
error CannotSetResolutionVoteTypeToUndefined (uint256 resolutionId);

/// @notice Error indicating that the voter has already voted for the resolution.
/// @param resolutionId The ID of the resolution.
/// @param voter The address of the voter.
error AlreadyVotedForResolution (uint256 resolutionId, address voter);

/// @notice Error indicating that voting for a resolution with an undefined vote type is not allowed.
/// @param resolutionId The ID of the resolution.
error CannotVoteForResolutionWithUndefinedVoteType (uint256 resolutionId);

/// @notice Error indicating that the tiebreaker has already been fulfilled.
error TiebreakerAlreadyFulfilled ();

/// @notice Error indicating that the tiebreaker request has not been fulfilled.
error TiebreakerRequestNotFulfilled ();

/// @notice Error indicating that the tiebreaker cannot be fulfilled with zero.
error TiebreakerCannotBeFulfilledWithZero ();

/// @notice Error indicating that the title is too short.
error TitleTooShort ();

/// @notice Error indicating that the title is too long.
error TitleTooLong ();

/// @notice Error indicating that the description is too short.
error DescriptionTooShort ();

/// @notice Error indicating that the description is too long.
error DescriptionTooLong ();

/// @notice Error indicating that the co-property name is too short.
error CopropertyNameTooShort ();

/// @notice Error indicating that the co-property name is too long.
error CopropertyNameTooLong ();