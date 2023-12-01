// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Common imports
import "./SDX.sol";

contract SyndxValidations {

    // Ensure address is not zero
    modifier notAddressZero(address _address) {
        require(_address != address(0), "Address zero not authorized");
        _;
    }

    // Ensure coproperty name is valid
    modifier validCopropertyName(string memory _name) {
        if (bytes(_name).length <= 3) revert ("Coproperty name too short");
        if (bytes(_name).length > 15) revert ("Coproperty name too long");
        _;
    }

    // Ensure token name is valid
    modifier validTokenName(string memory _name) {
        require(bytes(_name).length > TOKEN_NAME_MIN_LENGHT, "Token name too short");
        require(bytes(_name).length < TOKEN_NAME_MAX_LENGHT, "Token name too long");
        _;
    }

    // Ensure token symbol is valid
    modifier validTokenSymbol(string memory _symbol) {
        require(bytes(_symbol).length > TOKEN_SYMBOL_MIN_LENGHT, "Token symbol too short");
        require(bytes(_symbol).length < TOKEN_SYMBOL_MAX_LENGHT, "Token symbol too long");
        _;
    }

    // Ensure a title is valid
    modifier validTitle(string memory _title) {
        require(bytes(_title).length > TITLE_MIN_LENGHT, "Title is too short");
        require(bytes(_title).length < TITLE_MAX_LENGHT, "Title is too long");
        _;
    }

    // Ensure a description is valid
    modifier validDescription(string memory _description) {
        require(bytes(_description).length > DESCRIPTION_MIN_LENGHT, "Description is too short");
        require(bytes(_description).length < DESCRIPTION_MAX_LENGHT, "Description is too long");
        _;
    }
    
}