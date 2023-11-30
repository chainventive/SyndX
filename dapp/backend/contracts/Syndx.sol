// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";

// Contracts imports
import "./coproperty/Coproperty.sol";

// Events

contract Syndx is Ownable {

    // Keep track of created coproperty contracts
    mapping (string => address) public coproperties;

    // Keep track of deployed contracts allowed to ask for random number
    mapping (address => SDX.RandomnessConsumer) randomnessConsumers;

    // Ensure the caller is registered as randomnessConsumer
    modifier onlyAuthorizedRandomnessConsumers () {
        if (randomnessConsumers[msg.sender].authorized == false) revert ("Unauthorized randomness consumer");
        _;
    }

    // Emitted when a new coproperty contract is created
    event CopropertyContractCreated(string name, address syndic, address copropertyContract);

    // Syndx contract is owned by its deployer
    constructor() Ownable (msg.sender) {}

    // Create a new coproperty contract (only the owner of Syndx can create a coproperty)
    function createCoproperty(string memory _name, address _syndic) external onlyOwner returns (address) {
        
        if (bytes(_name).length <= 3) revert ("Coproperty name too short");
        if (bytes(_name).length > 15) revert ("Coproperty name too long");
        if (_syndic == address(0)) revert ("Address zero unauthorized");
        if (coproperties[_name] != address(0)) revert ("Coproperty already created");

        Coproperty coproperty = new Coproperty(_name, _syndic);
        coproperties[_name] = address(coproperty);

        emit CopropertyContractCreated(_name, _syndic, coproperties[_name]);

        return coproperties[_name];
    }

    // Create a new vote token contract (because there is 1 vote token per assembly, token contracts cannot )
    function createVoteToken() private returns (address) {
        
    }

    // Create a new vote assembly contract (only knowns coproperty contracts can call this function)
    function createVoteAssembly() external returns (address) {
        
    }

    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber(SDX.RandomStrategy _strategy) public onlyAuthorizedRandomnessConsumers {

    }

    // Get the random number requested by a consumer. Everybody can access this piece of information.
    function getRequestedRandomNumber(address _consumer) public returns (uint256) {

    }
}