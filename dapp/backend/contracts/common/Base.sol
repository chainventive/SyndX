// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "./Enums.sol";

library Base {

    struct Resolution {
        string title;
        string description;
        address author;
        Enums.VoteType voteType;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 yesCount;
        uint256 noCount;
    }

    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }

    struct RandomNumberRequest {
        uint256 requestId;
        uint256[] words;
    }
}