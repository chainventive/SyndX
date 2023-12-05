// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../_common/SDX.sol";
import "../_common/constants.sol";
import "../_common/errors/coproperty.sol";
import "../_common/errors/addresses.sol";

// Interface imports
import "./ICoproperty.sol";
import "../tokens/governance/IGovernanceToken.sol";
import "../assembly/IGeneralAssembly.sol";

// Contracts imports
import "../ISyndx.sol";

contract Coproperty is ICoproperty, Ownable {

    // The syndx contract
    ISyndx public syndx;

    // The name of the coproperty
    string public name;

    // Syndic address which administrate the coproperty
    address public syndic;

    // Coproperty gouvernance token contract
    IGovernanceToken public governanceToken;

    // List of all coproperty general assemblies
    IGeneralAssembly[] public generalAssemblies;

    // Emitted when a new general assembly contract is created
    event GeneralAssemblyContractCreated(uint256 id, address generalAssemblyContract);

    // Ensure the caller is the syndic of the coproperty
    modifier onlySyndic {
        if (syndic != msg.sender) revert NotCopropertySyndic(msg.sender);
        _;
    }

    // Syndx remain the owner of the contract;
    // This contract is administrated by a syndic;
    constructor (string memory _name, address _syndic, address _governanceTokenAddress) Ownable (msg.sender) {
        
        if (_syndic == address(0)) revert AddressZeroNotAllowed();

        if (bytes(_name).length <= COPROPERTY_NAME_MIN_LENGHT) revert CopropertyNameTooShort ();
        if (bytes(_name).length > COPROPERTY_NAME_MAX_LENGHT) revert CopropertyNameTooLong ();

        name   = _name;
        syndic = _syndic;
        syndx  = ISyndx(msg.sender);
        governanceToken = IGovernanceToken(_governanceTokenAddress);
    }

    // Get the address of the syndic in charge of the coproperty contract
    function getSyndic() external view returns (address) {
        return syndic;
    }

    // Get the governance token of the coproperty
    function getGovernanceToken() external view returns (IGovernanceToken) {
        return governanceToken;
    }
    
    // Ask Syndx to create a new general assembly contract
    // Only the syndic account is able to call this function
    function createGeneralAssembly(uint256 _voteStartTime) external onlySyndic {

        address generalAssemblyAddress = syndx.createGeneralAssembly(_voteStartTime);
        IGeneralAssembly generalAssembly = IGeneralAssembly(generalAssemblyAddress);

        generalAssemblies.push(generalAssembly);
        uint256 generalAssemblyID = generalAssemblies.length - 1;

        emit GeneralAssemblyContractCreated(generalAssemblyID, generalAssemblyAddress);
    }

    // Get the latest created general assembly
    function getLastestGeneralAssembly() external view returns (IGeneralAssembly) {

        if (generalAssemblies.length <= 0) revert NoGeneralAssemblyFound();

        return generalAssemblies[generalAssemblies.length-1];
    }

    // Get the total number of general assembly
    function getGeneralAssemblyCount() external view returns (uint256) {

        return generalAssemblies.length;
    }
}