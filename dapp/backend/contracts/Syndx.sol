// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./common/SDX.sol";
import "./common/errors/SyndxErrors.sol";

// Contracts imports
import "./ISyndx.sol";
import "./randomness/SyndxVRF.sol";
import "./coproperty/Coproperty.sol";
import "./coproperty/token/GovernanceToken.sol";
import "./coproperty/assembly/GeneralAssembly.sol";
import "./coproperty/assembly/token/VoteToken.sol";

// Events

contract Syndx is ISyndx, Ownable, SyndxVRF {

    // Keep track of created contract
    mapping (address => SDX.ContractType) public contracts;

    // Keep track of created coproperty contracts
    mapping (bytes => address) public coproperties;

    // Ensure the caller is registered as randomnessConsumer
    modifier onlyAuthorizedRandomnessConsumers () {
        if (consumerRequests[msg.sender].authorized == false) revert UnauthorizedRandomnessConsumer (msg.sender);
        _;
    }

    // Ensure the caller is a coproperty contract
    modifier onlyCopropertyContract {
        if (contracts[msg.sender] != SDX.ContractType.Coproperty) revert UnknownCopropertyContract(msg.sender);
        _;
    }

    // Emitted when a new coproperty contract is created
    event CopropertyContractCreated(bytes name, address syndic, address copropertyContract);

    // Emitted when a new general assembly contract is created
    event GeneralAssemblyContractCreated(address generalAssembly, address copropertyContract);

    // Emitted when a new general assembly contract is created
    event VoteTokenContractCreated(address voteToken, address generalAssembly, address copropertyContract);

    // Emitted when a randomness number request is reset for a given consumer (in order to keep tracks of what happened)
    event RandomnessRequestReset(uint256 requestID, address consumer);

    // Syndx contract is owned by its deployer
    constructor() Ownable (msg.sender) {}

    // Create a new coproperty contract (only the owner of Syndx can create a coproperty)
    function createCoproperty(bytes memory _name, bytes memory _tokenISO, address _syndic) external onlyOwner {

        if (coproperties[_name] != address(0)) revert ("Coproperty contract already created");

        if (_name.length <= 3) revert CopropertyNameTooShort (_name);
        if (_name.length > 15) revert CopropertyNameTooLong (_name);

        if (_tokenISO.length < TOKEN_ISO_MIN_LENGHT) revert TokenISOTooShort(_tokenISO);
        if (_tokenISO.length > TOKEN_ISO_MAX_LENGHT) revert TokenISOTooLong(_tokenISO); 

        bytes memory tokenName   = abi.encodePacked("SyndX Governance", " ", _tokenISO);
        bytes memory tokenSymbol = abi.encodePacked("syn", _tokenISO);

        GovernanceToken governanceToken = new GovernanceToken(_tokenISO, tokenName, tokenSymbol, _syndic);
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
        
        // Retrieve the coproperty which ask for a new general assembly and its governance token
    
        ICoproperty coproperty = ICoproperty(msg.sender);
        IGovernanceToken governanceToken = coproperty.getGovernanceToken();

        // Create the vote token for new general assembly

        uint256 generalAssemblyIndex = coproperty.getGeneralAssemblyCount() - 1;

        bytes memory tokenISO  = coproperty.getGovernanceToken().getTokenISO();
        bytes  memory tokenName = abi.encodePacked("SyndX Vote", " ", tokenISO, "-", generalAssemblyIndex);
        bytes  memory tokenSymbol = abi.encodePacked("vote", tokenISO, "-", generalAssemblyIndex);

        VoteToken voteToken = new VoteToken(governanceToken, coproperty.getSyndic(), tokenName, tokenSymbol);

        // Create a new general assembly contract

        GeneralAssembly generalAssembly = new GeneralAssembly(ISyndx(this), coproperty.getSyndic(), voteToken, _voteStartTime);

        address generalAssemblyAddress = address(generalAssembly);
        contracts[generalAssemblyAddress] = SDX.ContractType.GeneralAssembly;

        consumerRequests[generalAssemblyAddress].authorized = true;
        consumerRequests[generalAssemblyAddress].consumerType = SDX.ContractType.GeneralAssembly;

        // Setup the vote token luckup time

        voteToken.setLockupTime(generalAssembly.getLockupTime());

        // Emit events

        emit GeneralAssemblyContractCreated(generalAssemblyAddress, msg.sender);
        emit VoteTokenContractCreated(address(voteToken), generalAssemblyAddress, msg.sender);

        return generalAssemblyAddress;
    }

    // Reset the random request number of a given consumer
    // It can be helpful if the service provider fails to fullfill random words
    // If consumer request was already fullfilled the consumer request cannot be reseted
    function resetRandomNumberRequest(address _consumer) external onlyOwner {

        // Consomuer cannot be address zero
        if (_consumer == address(0)) revert AddressZeroNotAllowed();

        // The provided consumer must be an authorized randmness consumer
        if (consumerRequests[_consumer].authorized == false) revert UnauthorizedRandomnessConsumer(_consumer);

        // If yes get the current requestID associated to this consumer
        uint256 currentRequestID = consumerRequests[_consumer].requestID;

        // To be reset the current request must exists
        if (currentRequestID <= 0) revert ConsumerRequestNotFound(_consumer);
 
        // To be reset the current request must have not be already fullfilled
        if (consumerRequestResponses[currentRequestID].randomWords.length > 0) revert ConsumerRequestAlreadyFulfilled(_consumer, currentRequestID);

        // To be reset the current request must be older enough to prevent againt Syndx manipulation
        uint256 lockupEndBlockNumber = consumerRequests[_consumer].requesBlockNumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY;
        if (block.number < lockupEndBlockNumber) revert RandomNumberRequestLockupNotEndedYet(block.number, lockupEndBlockNumber);

        // Reset the consumer request
        consumerRequests[_consumer] = SDX.createAuthorizedConsumerRequest(contracts[_consumer]);

        emit RandomnessRequestReset(currentRequestID, _consumer);
    }


    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber() external onlyAuthorizedRandomnessConsumers {

        // Checks if a request was already made by the caller
        uint256 requestID = consumerRequests[msg.sender].requestID;
        if (requestID > 0) revert RandomNumberRequestAlreadyMade(requestID);

        // Perform the request for the caller consumer
        requestRandomWords(msg.sender);
    }
}