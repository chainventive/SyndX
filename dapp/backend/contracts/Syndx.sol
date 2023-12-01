// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";
import "./common/Validator.sol";

// Contracts imports
import "./randomness/SyndxVRF.sol";
import "./coproperty/Coproperty.sol";
import "./coproperty/token/CopropertyToken.sol";
import "./coproperty/assembly/GeneralAssembly.sol";

// Events

contract Syndx is Validator, Ownable, SyndxVRF {

    // Keep track of created contract
    mapping (address => SDX.ContractType) public contracts;

    // Keep track of created coproperty contracts
    mapping (string => address) public coproperties;

    // Ensure the caller is registered as randomnessConsumer
    modifier onlyAuthorizedRandomnessConsumers () {
        if (consumerRequests[msg.sender].authorized == false) revert ("Unauthorized randomness consumer");
        _;
    }

    // Ensure the caller is a coproperty contract
    modifier onlyCopropertyContract {
        if (contracts[msg.sender] != SDX.ContractType.Coproperty) revert ("Unknown coproperty contract");
        _;
    }

    // Emitted when a new coproperty contract is created
    event CopropertyContractCreated(string name, address syndic, address copropertyContract);

    // Emitted when a new general assembly contract is created
    event GeneralAssemblyContractCreated(address generalAssembly, address copropertyContract);

    // Emitted when a randomness number request is reset for a given consumer (in order to keep tracks of what happened)
    event RandomnessRequestReset(uint256 requestID, address consumer);

    // Syndx contract is owned by its deployer
    constructor() Ownable (msg.sender) {}

    // Create a new coproperty contract (only the owner of Syndx can create a coproperty)
    function createCoproperty(string memory _name, string memory _tokenName, string memory _tokenSymbol, address _syndic) external onlyOwner validCopropertyName(_name) validTokenName(_name) validTokenSymbol(_tokenSymbol) notAddressZero(_syndic) {

        if (coproperties[_name] != address(0)) revert ("Coproperty contract already created");

        CopropertyToken governanceToken = new CopropertyToken(_tokenName, _tokenSymbol, _syndic);
        address governanceTokenAddress = address(governanceToken);
        contracts[governanceTokenAddress] = SDX.ContractType.GovernanceToken;

        Coproperty coproperty = new Coproperty(_name, _syndic, governanceToken);
        address copropertyAddress = address(coproperty);
        coproperties[_name] = copropertyAddress;
        contracts[copropertyAddress] = SDX.ContractType.Coproperty;

        emit CopropertyContractCreated(_name, _syndic, coproperties[_name]);
    }

    // Create a new general assembly contract (only knowns coproperty contracts can call this function)
    function createGeneralAssembly(uint256 _voteStartTime) external onlyCopropertyContract returns (address) {
        
        Coproperty coproperty = Coproperty(msg.sender);
        GeneralAssembly generalAssembly = new GeneralAssembly(this, coproperty, _voteStartTime);

        address generalAssemblyAddress = address(generalAssembly);
        contracts[generalAssemblyAddress] = SDX.ContractType.GeneralAssembly;

        consumerRequests[generalAssemblyAddress].authorized = true;
        consumerRequests[generalAssemblyAddress].consumerType = SDX.ContractType.GeneralAssembly;

        emit GeneralAssemblyContractCreated(generalAssemblyAddress, msg.sender);

        return generalAssemblyAddress;
    }

    // Reset the random request number of a given consumer
    // It can be helpful if the service provider fails to fullfill random words
    // If consumer request was already fullfilled the consumer request cannot be reseted
    function resetRandomNumberRequest(address _consumer) external onlyOwner notAddressZero(_consumer) {

        // The provided consumer must be an authorized randmness consumer
        if (consumerRequests[_consumer].authorized == false) revert ("Unauthorized randomness consumer");

        // If yes get the current requestID associated to this consumer
        uint256 currentRequestID = consumerRequests[_consumer].requestID;

        // To be reset the current request must exists
        if (currentRequestID <= 0) revert ("There is no existing request for this consumer");
 
        // To be reset the current request must have not be already fullfilled
        if (consumerRequestResponses[currentRequestID].randomWords.length > 0) revert ("Consumer request already fullfilled");

        // To be reset the current request must be older enough to prevent againt Syndx manipulation
        if (block.number < (consumerRequests[_consumer].requesBlockNumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY)) revert ("Random number request lockup has not ended yet");

        // Reset the consumer request
        consumerRequests[_consumer] = SDX.createAuthorizedConsumerRequest(contracts[_consumer]);

        emit RandomnessRequestReset(currentRequestID, _consumer);
    }


    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber() public onlyAuthorizedRandomnessConsumers {

        // Checks if a request was already made by the caller
        if (consumerRequests[msg.sender].requestID > 0) revert ("Random number request already made");

        // Perform the request for the caller consumer
        requestRandomWords(msg.sender);
    }
}