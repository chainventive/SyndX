// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "./_common/SDX.sol";
import "./_common/errors/syndx.sol";

// Interfaces imports
import "./ISyndx.sol";
import "./tokens/ITokenFactory.sol";

// Contracts imports
import "./randomness/SyndxVRF.sol";
import "./coproperty/Coproperty.sol";
import "./assembly/GeneralAssembly.sol";

contract Syndx is ISyndx, Ownable, SyndxVRF {

    // The syndx token factory
    ITokenFactory public tokenFactory;

    // Keep track of created contract
    mapping (address => SDX.ContractType) public contracts;

    // Keep track of created coproperty contracts
    mapping (string => address) public coproperties;

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

    event CopropertyContractCreated(string copropertyName, address copropertyContract);
    event GovernanceTokenContractCreated(address tokenContract, address copropertyContract);
    event GeneralAssemblyContractCreated(address generalAssembly, address copropertyContract);
    event VoteTokenContractCreated(address tokenContract, address generalAssemblyContract);
    event RandomNumberRequestReset(uint256 requestID, address consumer);
    event RandomNumberRequested(address consumer);
    event TokenFactorySet(address beforeChange, address afterChange);

    // Syndx contract is owned by its deployer
    constructor(address _chainlinkVrfCoordinator, uint64 _chainlinkVrfSubscriptionID) SyndxVRF(_chainlinkVrfCoordinator, _chainlinkVrfSubscriptionID) Ownable (msg.sender) {}

    function setTokenFactory(address _address) external onlyOwner {

        address initialTokenFactory = address(tokenFactory);

        tokenFactory = ITokenFactory(_address);

        emit TokenFactorySet(initialTokenFactory, _address);
    }

    // Create a new coproperty contract (only the owner of Syndx can create a coproperty)
    function createCoproperty(string memory _name, string memory _tokenISO, address _syndic) external onlyOwner {

        if (coproperties[_name] != address(0)) revert CopropertyAlreadyCreated(_name);

        if (bytes(_name).length <= COPROPERTY_NAME_MIN_LENGHT) revert CopropertyNameTooShort ();
        if (bytes(_name).length > COPROPERTY_NAME_MAX_LENGHT) revert CopropertyNameTooLong ();

        address governanceTokenAddress = tokenFactory.createGovernanceToken(_tokenISO, _syndic, owner());
        contracts[governanceTokenAddress] = SDX.ContractType.GovernanceToken;

        Coproperty coproperty = new Coproperty(_name, _syndic, governanceTokenAddress);
        address copropertyAddress = address(coproperty);
        coproperties[_name] = copropertyAddress;
        contracts[copropertyAddress] = SDX.ContractType.Coproperty;

        emit CopropertyContractCreated(_name, copropertyAddress);
        emit GovernanceTokenContractCreated(governanceTokenAddress, copropertyAddress);
    }

    // Create a new general assembly contract (only knowns coproperty contracts can call this function)
    function createGeneralAssembly(uint256 _voteStartTime) external onlyCopropertyContract returns (address) {
        
        // Retrieve the coproperty which ask for a new general assembly and its governance token

        ICoproperty coproperty = ICoproperty(msg.sender);
        IGovernanceToken governanceToken = coproperty.getGovernanceToken();
    
        // Create the vote token for new general assembly

        address copropertySyndicAddress = coproperty.getSyndic();
        uint256 generalAssemblyID = coproperty.getGeneralAssemblyCount(); // We do not -1 cause the general assembly is created then
        address voteTokenAddress = tokenFactory.createVoteToken(governanceToken.getTokenISO(), generalAssemblyID, copropertySyndicAddress, address(governanceToken));

        // Create a new general assembly contract

        GeneralAssembly generalAssembly = new GeneralAssembly(ISyndx(this), copropertySyndicAddress, address(governanceToken), voteTokenAddress, _voteStartTime);

        address generalAssemblyAddress = address(generalAssembly);
        contracts[generalAssemblyAddress] = SDX.ContractType.GeneralAssembly;

        consumerRequests[generalAssemblyAddress].authorized = true;
        consumerRequests[generalAssemblyAddress].consumerType = SDX.ContractType.GeneralAssembly;

        // Setup vote token lockupt time according to general assembly timeline

        uint256 generalAssemblyLockuptTime = generalAssembly.getLockupTime();
        IVoteToken(voteTokenAddress).setLockupTime(generalAssemblyLockuptTime);

        // Emit events

        emit GeneralAssemblyContractCreated(generalAssemblyAddress, msg.sender);
        emit VoteTokenContractCreated(voteTokenAddress, generalAssemblyAddress);

        return generalAssemblyAddress;
    }

    // Reset the random request number of a given consumer
    // It can be helpful if the service provider fails to fullfill random words
    // If consumer request was already fullfilled the consumer request cannot be reseted
    function resetRandomNumberRequest(address _consumer) external onlyOwner {

        // Consumer cannot be address zero
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
        uint256 lockupEndBlockNumber = consumerRequests[_consumer].requestBlockNumber + RANDMNESS_REQUEST_BLOCKS_LOCKUP_BEFORE_RETRY;
        if (block.number < lockupEndBlockNumber) revert RandomNumberRequestLockupNotEndedYet(block.number, lockupEndBlockNumber);

        // Reset the consumer request
        consumerRequests[_consumer] = SDX.createAuthorizedConsumerRequest(contracts[_consumer]);

        emit RandomNumberRequestReset(currentRequestID, _consumer);
    }

    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber() external onlyAuthorizedRandomnessConsumers {

        // Checks if a request was already made by the caller
        uint256 requestID = consumerRequests[msg.sender].requestID;
        if (requestID > 0) revert RandomNumberRequestAlreadyMade(requestID);

        emit RandomNumberRequested(msg.sender);

        // Perform the request for the caller consumer
        requestRandomWords(msg.sender);
    }

    // Returns the state of a random number request
    function getConsumerRandomNumberRequest(address _consumer) external view returns (SDX.ConsumerRequest memory) {
        return consumerRequests[_consumer];
    }
}