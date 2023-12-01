// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/SDX.sol";
import "../common/Validator.sol";

// Interface imports
import "./token/ICopropertyToken.sol";

// Contracts imports
import "../Syndx.sol";
import "./assembly/GeneralAssembly.sol";

contract Coproperty is Validator, Ownable {

    // The syndx contract
    Syndx private syndx;

    // The name of the coproperty
    string public name;

    // Syndic address which administrate the coproperty
    address public syndic;

    // Coproperty gouvernance token contract
    ICopropertyToken public governanceToken;

    // List of all coproperty general assemblies
    GeneralAssembly[] public generalAssemblies;

    // Emitted when a new general assembly contract is created
    event GeneralAssemblyContractCreated(uint256 id, address generalAssembly);

    // Ensure the caller is the syndic of the coproperty
    modifier onlySyndic {
        require(syndic == msg.sender, "You're not the syndic of this coproperty");
        _;
    }

    // Syndx remain the owner of the contract;
    // This contract is administrated by a syndic;
    constructor (string memory _name, address _syndic, ICopropertyToken _governanceToken) Ownable (msg.sender) validCopropertyName(_name) notAddressZero(_syndic) {
        name   = _name;
        syndic = _syndic;
        syndx  = Syndx(msg.sender);
        governanceToken = _governanceToken;
    }

    // Ask Syndx to create a new general assembly contract
    // Only the syndic account is able to call this function
    function createGeneralAssembly(uint256 _voteStartTime) external onlySyndic {

        address generalAssemblyAddress = syndx.createGeneralAssembly(_voteStartTime);
        GeneralAssembly generalAssembly = GeneralAssembly(generalAssemblyAddress);

        generalAssemblies.push(generalAssembly);
        uint256 generalAssemblyID = generalAssemblies.length - 1;

        emit GeneralAssemblyContractCreated(generalAssemblyID, generalAssemblyAddress);
    }

    // Get the latest created general assembly
    function getLastestGeneralAssembly() external view returns (GeneralAssembly) {

        require (generalAssemblies.length > 0, 'There is no general assembly yet');

        return generalAssemblies[generalAssemblies.length-1];
    }

    // Get the total number of general assembly
    function getGeneralAssemblyCount() external view returns (uint256) {

        return generalAssemblies.length;
    }
}