// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error TokenISOTooLong();
error TokenISOTooShort();
error InvalidTokenOwnerAddress(address providedAddress);
error InvalidSyndicAddress(address providedAddress);
error InvalidGovernanceTokenAddress(address providedAddress);
error NotTokenAdministrator (address administrator, address caller);
error NotAuthorizedToSendTokens (address sender, address recipiant);
error NotAuthorizedToReceiveTokens (address sender, address recipiant);
error VoteTokensAlreadyClaimed (address claimer);
error PropertySharesBalanceIsZero (address caller);
error VoteTokenLockedUp (uint256 lockupTime);
error TokenTransferUnauthorized (address sender, address recipient);
error NotAuthorized();
error PropertyOwnerAlreadyAdded(address propertyOwner);