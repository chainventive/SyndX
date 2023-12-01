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

    enum RandomStrategy {
        Keccak256Based,
        ChainlinkVRF
    }

    /* STRUCTS */

    struct Resolution {
        string title;
        string description;
        address author;
        VoteType voteType;
        uint256 yesVotes;
        uint256 yesCount;
        uint256 noVotes;
        uint256 noCount;
    }

    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }

    struct RandomnessConsumer {
        bool authorized;
        uint256 requestID;
        uint256 randomWords;
    }

    struct GeneralAssemblyTimeline {
        uint256 created;    // When the general assembly was created
        uint256 lockup;     // Resolution and amendements cannot be created after this time
        uint256 voteStart;  // When the voting session starts
        uint256 voteEnd;    // When the voting session ends
    }
    
    /* HELPERS */

    function createResolution(string memory _title, string memory _description, address _author) internal pure returns (Resolution memory) {
        
        return Resolution(_title, _description, _author, VoteType.Undefined, 0, 0, 0, 0);
    }

    function createAmendment(uint256 _resolutionID, string memory _description, address _author) internal pure returns (Amendment memory) {
        
        return Amendment(_resolutionID, _description, _author);
    }
}