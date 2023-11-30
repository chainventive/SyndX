// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

library Enums {

    enum ContractType {
        Undetermined,
        Coproperty,
        SynToken,
        AGMeeting
    }

    enum VoteType {
        Undetermined,
        Unanimity,
        SimpleMajority,
        AbsoluteMajority,
        DoubleMajority
    }

    enum RandomnessStrategy {
        Keccak256Based,
        ChainlinkVRF
    }
}