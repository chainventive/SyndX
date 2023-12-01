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
import "./coproperty/token/CopropertyToken.sol";
import "./coproperty/assembly/GeneralAssembly.sol";

// Events

contract Syndx is SyndxValidations, Ownable {

    // Keep track of created contract
    mapping (address => SDX.ContractType) public contracts;

    // Keep track of created coproperty contracts
    mapping (string => address) public coproperties;

    // Keep track of deployed contracts allowed to ask for random number
    mapping (address => SDX.RandomnessConsumer) randomnessConsumers;

    // Ensure the caller is registered as randomnessConsumer
    modifier onlyAuthorizedRandomnessConsumers () {
        if (randomnessConsumers[msg.sender].authorized == false) revert ("Unauthorized randomness consumer");
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

        emit GeneralAssemblyContractCreated(generalAssemblyAddress, msg.sender);

        return generalAssemblyAddress;
    }

    // Ask for a random number (only authorized contracts are able to call)
    function requestRandomNumber() public onlyAuthorizedRandomnessConsumers {

    }

    // Get the random number requested by a consumer. Everybody can access this piece of information.
    function getRequestedRandomNumber(address _consumer) public returns (uint256) {

        return 17;
    }
}