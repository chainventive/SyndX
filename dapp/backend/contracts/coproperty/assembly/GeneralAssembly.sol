// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../common/SDX.sol";
import "../../common/SyndxValidations.sol";

// Interfaces imports
import '../token/ICopropertyToken.sol';

// Contracts imports
import "../../Syndx.sol";
import "../Coproperty.sol";

contract GeneralAssembly is SyndxValidations, Ownable {

    // The syndx contract
    Syndx private syndx;

    // The syndic account in charge of this general assembly
    address syndic;

    // The governance token of the coproperty
    ICopropertyToken governanceToken;

    // The general assembly timeline
    uint256 public creationTime;    // When the general assembly was created
    uint256 public lockupTime;      // Resolution and amendements cannot be created after this time
    uint256 public voteStartTime;   // When the voting session starts
    uint256 public voteEndTime;     // When the voting session ends

    // This contract remain owned by Syndx
    constructor(Syndx _syndx, Coproperty _coproperty, uint256 _voteStartTime) Ownable(msg.sender) {

        syndx = _syndx;
        syndic = _coproperty.syndic();
        governanceToken = _coproperty.governanceToken();

        _setMeetingTimeline(_voteStartTime);
    }

    // Set the general assembly timeline according to the expected start time
    function _setMeetingTimeline(uint256 _voteStartTime) private {

        // When the general assembly is created
        creationTime = block.timestamp;

        // Calculated lockup time according to the expected vote start time
        lockupTime = _voteStartTime - GENERAL_ASSEMBLY_LOCKUP_DURATION;

        // If the calculated lockup time occurs after the general assembly calculation we revert
        if (creationTime > lockupTime) revert ResolutionLockupTimeComeToEarly(creationTime, lockupTime, _voteStartTime);
        
        // If the timespan between the creation time and the start of the lockup is to short we revert cause we havent enought time to handle resolution submission and a safe enough lockup period
        if (lockupTime - creationTime < GENERAL_ASSEMBLY_MIN_DURATION_BEFORE_LOCKUP) revert ResolutionLockupTimeComeToEarly(creationTime, lockupTime, _voteStartTime);

        // Set the vote start time
        voteStartTime = _voteStartTime;

        // Calculate the vote end time
        voteEndTime = _voteStartTime + GENERAL_ASSEMBLY_VOTING_SESSION_DURATION;
    }
}