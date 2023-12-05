// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error CopropertyAlreadyCreated(string name);
error TokenISOTooShort (string iso);
error TokenISOTooLong (string iso);
error UnauthorizedRandomnessConsumer (address consumer);
error UnknownCopropertyContract (address contractAddress);
error ConsumerRequestNotFound (address consumer);
error ConsumerRequestAlreadyFulfilled (address consumer, uint256 requestId);
error RandomNumberRequestLockupNotEndedYet (uint256 currentBlockNumber, uint256 targetBlockNumber);
error RandomNumberRequestAlreadyMade (uint256 requestId);
