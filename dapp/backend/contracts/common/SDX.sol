// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./constants/CONST.sol";
import "./errors/ERRORS.sol";

library SDX {

    /* ENUMS */

    enum ContractType {
        Unknown,
        Coproperty,
        GovernanceToken,
        GeneralAssembly
    }

    enum VoteType {
        Undefined,
        Unanimity,
        SimpleMajority,
        AbsoluteMajority,
        DoubleMajority
    }

    /* STRUCTS */

    struct Resolution {
        string title;
        string description;
        address author;
        VoteType voteType;
        uint256 yesShares;
        uint256 yesCount;
        uint256 noShares;
        uint256 noCount;
    }

    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }

    struct ConsumerRequest {
        bool authorized;
        uint256 requestID;
        uint256 requesBlockNumber;
        SDX.ContractType consumerType;
    }

    struct ConsumerResponse {
        address consumer;
        uint256[] randomWords;
    }

    struct GeneralAssemblyTimeline {
        uint256 created;    // When the general assembly was created
        uint256 lockup;     // Resolution and amendements cannot be created after this time
        uint256 voteStart;  // When the voting session starts
        uint256 voteEnd;    // When the voting session ends
    }

    struct VoteResult {
        uint256 resolutionID;
        uint256 yesShares;  // Amount of property shares allocated to YES
        uint256 noShares;   // Amount of property shares allocated to NO
        uint256 yesCount;   // Number of YES votes
        uint256 noCount;    // Number of NO votes
        bool equality;      // If YES/NO votes are at equality
        uint256 tiebreaker; // Optional random number used to tie break equality
        bool approved;      // State of the resolution approval
    }
    
    /* HELPERS */

    function createResolution(string memory _title, string memory _description, address _author) internal pure returns (Resolution memory) {
        
        return Resolution(_title, _description, _author, VoteType.Undefined, 0, 0, 0, 0);
    }

    function createAmendment(uint256 _resolutionID, string memory _description, address _author) internal pure returns (Amendment memory) {
        
        return Amendment(_resolutionID, _description, _author);
    }

    function createUntalliedVoteResult(uint256 _resolutionID, Resolution memory _resolution) internal pure returns (VoteResult memory) {

        return VoteResult(_resolutionID, _resolution.yesShares, _resolution.noShares, _resolution.yesCount, _resolution.noCount, false, 0, false);
    }

    function createAuthorizedConsumerRequest(SDX.ContractType _contractType) internal pure returns (ConsumerRequest memory) {

        return ConsumerRequest(true, 0, 0, _contractType);
    }
}