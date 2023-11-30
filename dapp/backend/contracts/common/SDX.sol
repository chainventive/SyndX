// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "./constants/CONST.sol";
import "./errors/ERRORS.sol";

library SDX {

    /* ENUMS */

    enum ContractType {
        Undetermined,
        Coproperty,
        VoteAssembly,
        VoteToken
    }

    enum VoteType {
        Undetermined,
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
    
    /* HELPERS */

    function createResolution(string memory _title, string memory _description, address _author) internal pure returns (Resolution memory) {
        
        return Resolution(_title, _description, _author, VoteType.Undetermined, 0, 0, 0, 0);
    }

    function createAmendment(uint256 _resolutionID, string memory _description, address _author) internal pure returns (Amendment memory) {
        
        return Amendment(_resolutionID, _description, _author);
    }
}