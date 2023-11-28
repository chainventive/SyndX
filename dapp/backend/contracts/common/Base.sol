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
    }

    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }


    // deprectated
    struct VoteSession {
        bool alreadyUsed;
        uint256 noCount;
        uint256 yesCount;
        uint256 blankCount;
        uint256 resolutionID;
        uint256 expiryTimestamp;
        Enums.VoteType voteType;
        mapping (address => bool) hasVoted;
    }
}