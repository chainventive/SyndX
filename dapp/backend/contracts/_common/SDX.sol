// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

/// @title SDX Library for Syndx Co-Property Management System
/// @dev This library provides enums, structs, and helper functions for the Syndx ecosystem.
library SDX {

    /* ENUMS */

    /// @notice Enum for identifying the type of contract within the Syndx ecosystem.
    enum ContractType {
        Unknown,
        Coproperty,
        GovernanceToken,
        GeneralAssembly
    }

    /// @notice Enum for defining the types of voting methodologies.
    enum VoteType {
        Undefined,
        Unanimity,
        SimpleMajority,
        AbsoluteMajority,
        DoubleMajority
    }

    /* STRUCTS */

    /// @notice Struct for representing a resolution within a general assembly.
    struct Resolution {
        string title;
        string description;
        address author;
        VoteType voteType;
        uint32 yesShares;
        uint32 yesCount;
        uint32 noShares;
        uint32 noCount;
    }

    /// @notice Struct for representing an amendment to a resolution.
    struct Amendment {
        uint256 resolutionID;
        string  description;
        address author;
    }

    /// @notice Struct for tracking consumer requests for random numbers.
    struct ConsumerRequest {
        bool authorized;
        uint256 requestID;
        uint256 requestBlockNumber;
        SDX.ContractType consumerType;
    }

    /// @notice Struct for storing responses to consumer requests.
    struct ConsumerResponse {
        address consumer;
        uint256[] randomWords;
    }

    /// @notice Struct for detailing the timeline of a general assembly.
    struct GeneralAssemblyTimeline {
        uint256 created;    // When the general assembly was created
        uint256 lockup;     // Resolution and amendements cannot be created after this time
        uint256 voteStart;  // When the voting session starts
        uint256 voteEnd;    // When the voting session ends
    }

    /// @notice Struct for representing the result of a vote on a resolution.
    struct VoteResult {
        uint256 resolutionID;
        uint32 yesShares;    // Amount of property shares allocated to YES
        uint32 noShares;     // Amount of property shares allocated to NO
        uint32 yesCount;     // Number of YES votes
        uint32 noCount;      // Number of NO votes
        uint256 tiebreaker;  // Optional random number used to tie break equality
        bool equality;       // If YES/NO votes are at equality
        bool approved;       // State of the resolution approval
    }
    
    /* HELPERS */

    /// @notice Creates a new resolution.
    /// @param _title Title of the resolution.
    /// @param _description Description of the resolution.
    /// @param _author Author of the resolution.
    /// @return A new Resolution struct.
    function createResolution(string memory _title, string memory _description, address _author) internal pure returns (Resolution memory) {
        
        return Resolution(_title, _description, _author, VoteType.Undefined, 0, 0, 0, 0);
    }

    /// @notice Creates a new amendment.
    /// @param _resolutionID ID of the resolution being amended.
    /// @param _description Description of the amendment.
    /// @param _author Author of the amendment.
    /// @return A new Amendment struct.
    function createAmendment(uint256 _resolutionID, string memory _description, address _author) internal pure returns (Amendment memory) {
        
        return Amendment(_resolutionID, _description, _author);
    }

    /// @notice Creates an initial vote result for a resolution.
    /// @param _resolutionID ID of the resolution.
    /// @param _resolution The resolution object.
    /// @return An initial VoteResult struct for the resolution.
    function createUntalliedVoteResult(uint256 _resolutionID, Resolution memory _resolution) internal pure returns (VoteResult memory) {

        return VoteResult(_resolutionID, _resolution.yesShares, _resolution.noShares, _resolution.yesCount, _resolution.noCount, 0, false, false);
    }

    /// @notice Creates a new authorized consumer request for random numbers.
    /// @param _contractType The type of the contract making the request.
    /// @return A new ConsumerRequest struct.
    function createAuthorizedConsumerRequest(SDX.ContractType _contractType) internal pure returns (ConsumerRequest memory) {

        return ConsumerRequest(true, 0, 0, _contractType);
    }
}