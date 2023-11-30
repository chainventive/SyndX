// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

library Constants {

    // COPROPERTY
    uint256 constant COPRO_NAME_MIN_LENGHT = 1;
    uint256 constant COPRO_NAME_MAX_LENGHT = 32;

    // TOKEN
    uint256 constant SYN_TOKEN_TOTAL_SUPPLY  = 10000;
    uint256 constant TOKEN_NAME_MIN_LENGHT   = 1;
    uint256 constant TOKEN_NAME_MAX_LENGHT   = 16;
    uint256 constant TOKEN_SYMBOL_MIN_LENGHT = 1;
    uint256 constant TOKEN_SYMBOL_MAX_LENGHT = 6;

    // RESOLUTION & AMENDMENT
    uint256 constant TITLE_MIN_LENGHT = 1;
    uint256 constant TITLE_MAX_LENGHT = 32;
    uint256 constant DESCRIPTION_MIN_LENGHT = 1;
    uint256 constant DESCRIPTION_MAX_LENGHT = 500;

    // TIMELINE
    uint256 constant MIN_DURATION_BEFORE_LOCKUP  = 15;
    uint256 constant RESOLUTIONS_LOCKUP_DURATION = 30;
    uint256 constant VOTE_SESSION_DURATION = 300; // set 300 for sepolia testing to let the time for voters to submit their votes

    // CHAINLINK VRF
    // MUMBAI -> 6586 / 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f / 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
    // SEPOLIA -> 7287 / 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c / 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
    uint64  constant CHAINLINK_VRF_SUBSCRIPTION_ID = 7287;
    bytes32 constant CHAINLINK_VRF_GASLANE_KEYHASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    address constant CHAINLINK_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    uint32  constant CHAINLINK_VRF_CALLBACK_GAS_LIMIT = 1000000;
    uint16  constant CHAINLINK_VRF_REQUEST_CONFIRMATIONS = 3;
    uint32  constant CHAINLINK_VRF_WORDCOUNT_PER_REQUEST = 1;
    
}
