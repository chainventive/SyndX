// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// SyndxFactory
error InvalidSyndxFactoryAddress();

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


