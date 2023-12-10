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

/// @title Coproperty Contract
/// @notice Contract for managing individual coproperties within the Syndx ecosystem
/// @dev Implements the ICoproperty interface and inherits from Ownable
contract Coproperty is ICoproperty, Ownable {

    /// @notice Reference to the Syndx contract
    ISyndx public syndx;

    /// @notice Name of the coproperty
    string public name;

    /// @notice Address of the syndic who administrates the coproperty
    address public syndic;

    /// @notice Governance token contract for the coproperty
    IGovernanceToken public governanceToken;

    /// @notice List of all general assemblies associated with the coproperty
    IGeneralAssembly[] public generalAssemblies;

    /// @notice Emitted when a new general assembly contract is created
    event GeneralAssemblyContractCreated(uint256 id, address generalAssemblyContract);

    /// @notice Ensures that the function is only called by the syndic of the coproperty
    modifier onlySyndic {
        if (syndic != msg.sender) revert NotCopropertySyndic(msg.sender);
        _;
    }

    /// @notice Initializes a new Coproperty contract
    /// @dev Sets the coproperty name, syndic, and associated governance token
    /// @param _name Name of the coproperty
    /// @param _syndic Address of the coproperty's syndic
    /// @param _governanceTokenAddress Address of the governance token for the coproperty
    constructor (string memory _name, address _syndic, address _governanceTokenAddress) Ownable (msg.sender) {
        
        if (_syndic == address(0)) revert AddressZeroNotAllowed();

        if (bytes(_name).length <= COPROPERTY_NAME_MIN_LENGHT) revert CopropertyNameTooShort ();
        if (bytes(_name).length > COPROPERTY_NAME_MAX_LENGHT) revert CopropertyNameTooLong ();

        name   = _name;
        syndic = _syndic;
        syndx  = ISyndx(msg.sender);
        governanceToken = IGovernanceToken(_governanceTokenAddress);
    }

    /// @notice Retrieves the address of the syndic in charge of the coproperty
    /// @return Address of the coproperty's syndic
    function getSyndic() external view returns (address) {
        return syndic;
    }

    /// @notice Retrieves the governance token of the coproperty
    /// @return Governance token contract associated with the coproperty
    function getGovernanceToken() external view returns (IGovernanceToken) {
        return governanceToken;
    }
    
    /// @notice Requests Syndx to create a new general assembly contract for the coproperty
    /// @dev Only callable by the syndic of the coproperty
    /// @param _voteStartTime The start time for the general assembly's voting process
    function createGeneralAssembly(uint256 _voteStartTime) external onlySyndic {

        address generalAssemblyAddress = syndx.createGeneralAssembly(_voteStartTime);
        IGeneralAssembly generalAssembly = IGeneralAssembly(generalAssemblyAddress);

        generalAssemblies.push(generalAssembly);
        uint256 generalAssemblyID = generalAssemblies.length - 1;

        emit GeneralAssemblyContractCreated(generalAssemblyID, generalAssemblyAddress);
    }

    /// @notice Retrieves the latest created general assembly for the coproperty
    /// @return The latest general assembly contract
    /// @dev Reverts if no general assembly has been created yet
    function getLastestGeneralAssembly() external view returns (IGeneralAssembly) {

        if (generalAssemblies.length <= 0) revert NoGeneralAssemblyFound();

        return generalAssemblies[generalAssemblies.length-1];
    }

    /// @notice Retrieves the total number of general assemblies created for the coproperty
    /// @return Total count of general assemblies
    function getGeneralAssemblyCount() external view returns (uint256) {

        return generalAssemblies.length;
    }
}
