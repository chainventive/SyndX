// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract AG is Ownable { // The owner is the syndic

    // consensus Types
    enum Consensus {
        SimpleMajority,
        AbsoluteMajority,
        DoubleMajority,
        Unanimity
    }

    // resolution
    struct Resolution {
        string title;
        string description;
        address votingContract;
        string moderationMessage;
        bool moderated;
    }

    // resolution amendement
    struct Amendment {
        address author;
        string description;
    }

    // AG epochs
    uint256 public whenFreeze;
    uint256 public whenStartVote;
    uint256 public whenCloseVote;

    // property owners
    mapping (address => uint256) private propertyOwnerShares; // stocker le hash du document notarial ?

    // resolutions
    Resolution[] private resolutions;
    mapping (uint256 => uint256[]) private resolutionToAmendements;

    // amendements
    Amendment[] private amendments;

    // constructor
    constructor(uint256 _whenFreeze, uint256 _whenStartVote, uint256 _whenCloseVote) Ownable(msg.sender) {
        whenFreeze = _whenFreeze;
        whenStartVote = _whenStartVote;
        whenCloseVote = _whenCloseVote;
    }

    // modifiers
    modifier onlyPropertyOwners() {
        require(propertyOwnerShares[msg.sender] > 0, "You're not a property owner !");
        _;
    }
    modifier onlyBeforeFreeze() {
        require(whenFreeze >= block.timestamp, "AG has entered its frozen epoch !");
        _;
    }

    // :::::::::::::::::::::::::::::::: SYNDIC FUNCTIONS :::::::::::::::::::::::::::::::: //

    // setPropertyOwnerShares()  * onlyBeforeFreeze()

    function setPropertyOwnerSurface(address _propertyOwner, uint256 _shares) onlyOwner onlyBeforeFreeze external {

        require(_propertyOwner != address(0), "Zero address not allowed");
        require(_shares != propertyOwnerShares[_propertyOwner], "This m2 surface was already provided !");

        propertyOwnerShares[_propertyOwner] = _shares;
    }

    // setWhenFreeze()     * onlyBeforeFreeze()
    // setWhenStartVote()  * onlyBeforeFreeze()
    // setWhenCloseVote()  * onlyBeforeFreeze()
    // moderate()         
    // assignConsensus()

    // :::::::::::::::::::::::::::: PROPERTY OWNERS FUNCTIONS ::::::::::::::::::::::::::: //

    // amend() * beforeFreezeOnly()

    // ::::::::::::::::::::::: SYNDIC && PROPERTY OWNERS FUNCTIONS :::::::::::::::::::::: //

    // createResolution()  * onlyBeforeFreeze()
    // getPropertyOwners()
    // getPropertyResolution()

    // ::::::::::::::::::::::::::::: MANAGE FUNDS FUNCTIONS ::::::::::::::::::::::::::::: //

}