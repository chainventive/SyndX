// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/SDX.sol";
import "../common/SyndxValidations.sol";

// Interface imports
import "./token/ICopropertyToken.sol";

contract Coproperty is SyndxValidations, Ownable {

    // The name of the coproperty
    string public name;

    // Syndic address which administrate the coproperty
    address public syndic;

    // Coproperty gouvernance token contract
    ICopropertyToken public governanceToken;

    // Ensure the caller is the syndic of the coproperty
    modifier onlySyndic {
        require(syndic == msg.sender, "You're not the syndic of this coproperty");
        _;
    }

    // Syndx remain the owner of the contract;
    // This contract is administrated by a syndic;
    constructor (string memory _name, address _syndic, ICopropertyToken _governanceToken) Ownable (msg.sender) validCopropertyName(_name) notAddressZero(_syndic) {
        name   = _name;
        syndic = _syndic;
        governanceToken = _governanceToken;
    }
}