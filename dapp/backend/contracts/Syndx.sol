// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";

contract Syndx is Ownable {

    // Keep track of deployed contracts allowed to ask for random number
    mapping (address => SDX.RandomnessConsumer) randomnessConsumers;

    // Ensure the caller is registered as randomnessConsumer
    modifier onlyAuthorizedRandomnessConsumers () {

        if (randomnessConsumers[msg.sender].authorized == false) revert ("Unauthorized randomness consumer");
        _;
    }

    // Syndx contract is owned by its deployer
    constructor() Ownable (msg.sender) {

    }

    // Create a new coproperty contract
    function createCoproperty() external returns (address) {
        
    }

    // Create a new vote token contract
    function createVoteToken() external returns (address) {
        
    }

    // Create a new vote assembly contract
    function createVoteAssembly() external returns (address) {
        
    }

    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber(SDX.RandomStrategy _strategy) public onlyAuthorizedRandomnessConsumers {

    }

    // Get the random number requested by a consumer. Everybody can access this piece of information.
    function getRequestedRandomNumber(address _consumer) public returns (uint256) {

    }
}