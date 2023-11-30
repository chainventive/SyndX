// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";
import "./common/SyndxValidations.sol";

// Contracts imports
import "./coproperty/Coproperty.sol";
import "./coproperty/CopropertyToken.sol";

// Events

contract Syndx is SyndxValidations, Ownable {

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
    function createCoproperty(string memory _name, string memory _tokenName, string memory _tokenSymbol, address _syndic) external onlyOwner validCopropertyName(_name) validTokenName(_name) validTokenSymbol(_tokenSymbol) notAddressZero(_syndic) {

        if (coproperties[_name] != address(0)) revert ("Coproperty already created");

        CopropertyToken governanceToken = new CopropertyToken(_tokenName, _tokenSymbol, _syndic);

        Coproperty coproperty = new Coproperty(_name, _syndic, governanceToken);
        coproperties[_name] = address(coproperty);

        emit CopropertyContractCreated(_name, _syndic, coproperties[_name]);
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