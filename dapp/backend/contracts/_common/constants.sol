// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";


/* Constants for Syndx Co-Property Management System */

// The maximum supply of property shares.
uint256 constant PROPERTY_SHARES_MAX_SUPPLY = 10000;

// The minimum length for a token ISO identifier.
uint256 constant TOKEN_ISO_MIN_LENGHT = 1;

// The maximum length for a token ISO identifier.
uint256 constant TOKEN_ISO_MAX_LENGHT = 6;

// The minimum duration before lockup for a general assembly.
uint256 constant GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP  = 300;

// The duration of the lockup period for a general assembly.
uint256 constant GENERAL_ASSEMBLY_LOCKUP_DURATION = 30;

// The duration of the voting session for a general assembly.
uint256 constant GENERAL_ASSEMBLY_VOTING_SESSION_DURATION = 240;

// The minimum length for a co-property name.
uint256 constant COPROPERTY_NAME_MIN_LENGHT = 3;

// The maximum length for a co-property name.
uint256 constant COPROPERTY_NAME_MAX_LENGHT = 15;

// The minimum length for a resolution title.
uint256 constant TITLE_MIN_LENGHT = 1;

// The maximum length for a resolution title.
uint256 constant TITLE_MAX_LENGHT = 35;

// The minimum length for a resolution or amendment description.
uint256 constant DESCRIPTION_MIN_LENGHT = 1;

// The maximum length for a resolution or amendment description.
uint256 constant DESCRIPTION_MAX_LENGHT = 500;

// The number of blocks to lock up before retrying a randomness request.
uint256 constant RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY = 5;


/* Constants for Chainlink VRF Integration */

// https://vrf.chain.link/mumbai
// Mumbai Subscription -> 6586
// Mumbai VRF Coordinator -> 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
// Mumbai KeyHash -> 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f

// https://vrf.chain.link/sepolia
// Sepolia Subscription -> 7287
// Sepolia VRF Coordinator -> 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
// Sepolia KeyHash -> 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c

// The number of confirmations required for a Chainlink VRF request.
uint16  constant CHAINLINK_VRF_REQUEST_CONFIRMATIONS = 3;

// The word count per request for a Chainlink VRF response.
uint32  constant CHAINLINK_VRF_WORDCOUNT_PER_REQUEST = 1;

// The gas limit for Chainlink VRF callback functions.
uint32  constant CHAINLINK_VRF_CALLBACK_GAS_LIMIT = 100000;

// The address of the Chainlink VRF Coordinator.
address constant CHAINLINK_VRF_COORDINATOR = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;

// The key hash for the Chainlink VRF gas lane.
bytes32 constant CHAINLINK_VRF_GASLANE_KEYHASH = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;