// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error NotTokenAdministrator (address caller);
error NotAuthorizedToSendTokens (address sender);
error NotAuthorizedToReceiveTokens (address recipiant);
error VoteTokensAlreadyClaimed (address claimer);
error PropertySharesBalanceIsZero (address caller);
error VoteTokenLockedUp (uint256 lockupTime);