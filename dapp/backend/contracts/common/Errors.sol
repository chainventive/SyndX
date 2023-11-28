// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// SyndxFactory
error InvalidSyndxFactoryAddress();
error UnknowVoteType();

// Address
error AddressZeroUnauthorized();

// Authorization
error Unauthorized(string expected);

// Syndic
error InvalidSyndicAdress();

// Coproperty
error InvalidCopropertyNameLength();
error CopropertyNotFound(string name);
error CopropertyNameAlreadyUsed(string name);
error CopropertyMemberExpected();
error SyndicAddressUndefined();

// AG Meetings
error MeetingListIsEmpty();

// Token
error MissingTokenContract();
error InvalidTokenNameLength();
error InvalidTokenSymbolLength();
error InvalidTokenAdminAdress();
error AddressUnauthorizedToSendToken(address sender);
error AddressUnauthorizedToReceiveToken(address recipient);

// Resolution
error InvalidTitleLength();
error InvalidDescriptionLength();
error ResolutionNotFound(uint256 id);
error ResolutionVoteTypeNonAssignated(uint256 id);
error ResolutionVoteTypeIsUnknown(uint256 id);

// Timeline
error ResolutionLockupTimeComeToEarly(uint256 votingStartTime, uint256 resolutionLockupTime, uint256 minDurationBeforeLockup);
error ResolutionAreNowLocked();
error VotingPeriodHasNotStarted();
error VotingPeriodHasEnded();
error VotingPeriodHasNotEnded();

// Votes
error YouAlreadyVotedForThisResolution(uint256 resolutionID);
error TieBreakNeedToBeCalled(uint256 resolutionID);

// NOT USED
error CurrentVoteSessionNotEnded();
error CurrentVoteSessionAlreadyUsed();
error VoteSessionNotFound(uint256 id);
error UndeterminedVoteType();


