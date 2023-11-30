// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// SyndxFactory
error MissingSyndxFactoryContract();
error InvalidSyndxFactoryAddress();
error UnknowVoteType();
error NotImplementedException();
error UnauthorizedContract();

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
error ResolutionLockupTimeComeToEarly(uint256 creationTime, uint256 lockupTime, uint256 votingStartTime);
error ResolutionAreNowLocked();
error VotingPeriodHasNotStarted();
error VotingPeriodHasEnded();
error VotingPeriodHasNotEnded();

// Votes
error YouAlreadyVotedForThisResolution(uint256 resolutionID);
error TieBreakNeedToBeCalled(uint256 resolutionID);
error ResolutionVoteTypeCannotBassignatedToUdetermined(uint256 resolutionID);

// Random Chainlink
error TiebreackRequestAlreadyAcknowledged();
error TiebreackNumberAlreadyDeterminated();
error RandomNumberRequestNotSent();
error RandomNumberRequestIsPending();
error UnknownRandomnessStrategy();
error RandomNumberRequestAlreadyFullfilled();
error RandomNumberRequestNotFullfilled();