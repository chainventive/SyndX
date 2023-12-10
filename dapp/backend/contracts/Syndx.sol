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

/// @title Syndx - A decentralized platform for coproperty management and governance
/// @notice This contract implements the functionalities for creating and managing coproperties and associated governance mechanisms.
/// @dev Inherits from Ownable for ownership functionalities and SyndxVRF for verifiable randomness.
contract Syndx is ISyndx, Ownable, SyndxVRF {

    /// @notice Address of the token factory contract used for creating new token contracts
    /// @dev Holds the reference to the ITokenFactory interface to interact with the token factory
    /// @dev This factory is responsible for creating new types of tokens like governance and vote tokens within the Syndx ecosystem
    ITokenFactory public tokenFactory;

    /// @notice Mapping of contract addresses to their respective contract types within the Syndx ecosystem
    /// @dev Stores the type of each contract (e.g., Coproperty, General Assembly, Governance Token, etc.) as defined in the SDX enum
    /// @dev Provides a way to identify the nature of each contract address registered in the Syndx platform
    mapping (address => SDX.ContractType) public contracts;

    /// @notice Mapping of coproperty names to their corresponding contract addresses
    /// @dev Stores and provides access to addresses of coproperty contracts, indexed by their names
    mapping (string => address) public coproperties;

    /// @notice Ensures that the function is only callable by consumers authorized for randomness requests
    /// @dev Checks if the calling address is marked as authorized in `consumerRequests`
    /// @dev Reverts with `UnauthorizedRandomnessConsumer` if the calling address is not authorized
    modifier onlyAuthorizedRandomnessConsumers () {
        if (consumerRequests[msg.sender].authorized == false) revert UnauthorizedRandomnessConsumer (msg.sender);
        _;
    }

    /// @notice Ensures that the function is only called by a registered coproperty contract
    /// @dev Verifies that the calling address is associated with a coproperty contract in the `contracts` mapping
    /// @dev Reverts with `UnknownCopropertyContract` if the calling address is not a registered coproperty contract
    modifier onlyCopropertyContract {
        if (contracts[msg.sender] != SDX.ContractType.Coproperty) revert UnknownCopropertyContract(msg.sender);
        _;
    }

    /// @dev Emitted when a new coproperty contract is created
    /// @param copropertyName The name of the newly created coproperty
    /// @param copropertyContract The address of the newly created coproperty contract
    event CopropertyContractCreated(string copropertyName, address copropertyContract);

    /// @dev Emitted when a new governance token contract is created
    /// @param tokenContract The address of the newly created governance token contract
    /// @param copropertyContract The address of the coproperty contract for which the governance token is created
    event GovernanceTokenContractCreated(address tokenContract, address copropertyContract);

    /// @dev Emitted when a new general assembly contract is created
    /// @param generalAssembly The address of the newly created general assembly contract
    /// @param copropertyContract The address of the coproperty contract for which the general assembly is created
    event GeneralAssemblyContractCreated(address generalAssembly, address copropertyContract);

    /// @dev Emitted when a new vote token contract is created
    /// @param tokenContract The address of the newly created vote token contract
    /// @param generalAssemblyContract The address of the general assembly contract for which the vote token is created
    event VoteTokenContractCreated(address tokenContract, address generalAssemblyContract);

    /// @dev Emitted when a random number request is reset
    /// @param requestID The ID of the reset random number request
    /// @param consumer The address of the consumer whose random number request was reset
    event RandomNumberRequestReset(uint256 requestID, address consumer);

    /// @dev Emitted when a random number is requested
    /// @param consumer The address of the consumer requesting the random number
    event RandomNumberRequested(address consumer);

    /// @dev Emitted when the token factory address is changed
    /// @param beforeChange The address of the token factory before the change
    /// @param afterChange The address of the token factory after the change
    event TokenFactorySet(address beforeChange, address afterChange);

    /// @notice Initializes a new instance of the Syndx contract
    /// @dev Sets up the Syndx contract with Chainlink VRF coordinator and subscription ID for randomness, and sets the deployer as the owner
    /// @param _chainlinkVrfCoordinator The address of the Chainlink VRF Coordinator
    /// @param _chainlinkVrfSubscriptionID The Chainlink VRF subscription ID
    constructor(address _chainlinkVrfCoordinator, uint64 _chainlinkVrfSubscriptionID) SyndxVRF(_chainlinkVrfCoordinator, _chainlinkVrfSubscriptionID) Ownable (msg.sender) {}

    /// @notice Sets a new token factory address
    /// @dev Only callable by the contract owner
    /// @param _address The new token factory address
    function setTokenFactory(address _address) external onlyOwner {

        address initialTokenFactory = address(tokenFactory);

        tokenFactory = ITokenFactory(_address);

        emit TokenFactorySet(initialTokenFactory, _address);
    }

    /// @notice Creates a new coproperty contract
    /// @dev Only callable by the contract owner
    /// @param _name Name of the coproperty
    /// @param _tokenISO ISO code for the governance token
    /// @param _syndic Address of the syndic for the coproperty
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

    /// @notice Creates a new general assembly contract for a coproperty
    /// @dev Only callable by a coproperty contract
    /// @param _voteStartTime The start time for the vote in the general assembly
    /// @return The address of the newly created general assembly contract
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

    /// @notice Reset the random number request for a given consumer
    /// @dev Can only be called by the contract owner
    /// @param _consumer Address of the consumer whose random number request is to be reset
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

    /// @notice Requests a random number for the calling contract
    /// @dev Can only be called by authorized randomness consumers
    function requestRandomNumber() external onlyAuthorizedRandomnessConsumers {

        // Checks if a request was already made by the caller
        uint256 requestID = consumerRequests[msg.sender].requestID;
        if (requestID > 0) revert RandomNumberRequestAlreadyMade(requestID);

        emit RandomNumberRequested(msg.sender);

        // Perform the request for the caller consumer
        requestRandomWords(msg.sender);
    }

    /// @notice Retrieves the random number request state for a given consumer
    /// @dev Returns the consumer request details
    /// @param _consumer Address of the consumer to query
    /// @return Consumer request details
    function getConsumerRandomNumberRequest(address _consumer) external view returns (SDX.ConsumerRequest memory) {
        return consumerRequests[_consumer];
    }
}