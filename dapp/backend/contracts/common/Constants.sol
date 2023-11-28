// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

library Constants {

    // COPROPERTY
    uint256 constant COPRO_NAME_MIN_LENGHT = 1;
    uint256 constant COPRO_NAME_MAX_LENGHT = 32;

    // TOKEN
    uint256 constant SYN_TOKEN_TOTAL_SUPPLY = 10000;
    uint256 constant TOKEN_NAME_MIN_LENGHT = 1;
    uint256 constant TOKEN_NAME_MAX_LENGHT = 16;
    uint256 constant TOKEN_SYMBOL_MIN_LENGHT = 1;
    uint256 constant TOKEN_SYMBOL_MAX_LENGHT = 6;

    // RESOLUTION & AMENDMENT
    uint256 constant TITLE_MIN_LENGHT = 1;
    uint256 constant TITLE_MAX_LENGHT = 32;
    uint256 constant DESCRIPTION_MIN_LENGHT = 1;
    uint256 constant DESCRIPTION_MAX_LENGHT = 500;

    // TIMELINE
    uint256 constant MIN_DURATION_BEFORE_LOCKUP = 30;
    uint256 constant RESOLUTIONS_LOCKUP_DURATION = 30;
    uint256 constant VOTE_SESSION_DURATION = 30;
}
