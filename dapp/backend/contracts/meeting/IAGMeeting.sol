// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "../common/Base.sol";

interface IAGMeeting {

    // Add a resolution
    function createResolution(string calldata _title, string calldata _description) external returns(uint256);

    // Amend a resolution
    function amendResolution(uint256 _resolutionID, string calldata _description) external returns(uint256);

    // Get the quantity of resolutions
    function getResolutionCount() external view returns(uint256);

    // Get a resolution by its ID
    function getResolution(uint256 _resolutionID) external view returns(Base.Resolution memory);

    // Get the quantity of amendments
    function getAmendementCount() external view returns(uint256);

    // Get an amendment by its ID
    function getAmendment(uint256 _amendementID) external view returns(Base.Amendment memory);

    // Assign a vote type to a resolution by its ID
    function assignResolutionVoteType(uint256 _resolutionID, Enums.VoteType _voteType) external;

    // Get the meeting time line
    function getMeetingTimeline() external view returns (uint256 created, uint256 lockup, uint256 voteStart, uint256 voteEnd);

    // vote for a resolution
    function vote(uint256 _resolutionID, bool _approve) external;

    // get if a resolution is approved or rejected
    function getVoteResult(uint256 _resolutionID) external view returns(bool approved, uint256 yesCount, uint256 noCount, uint256 tiebreak);

    // défait les égalitées grâçe a une nombre random obtenu aupres de chainlink
    function tieBreak() external;
}