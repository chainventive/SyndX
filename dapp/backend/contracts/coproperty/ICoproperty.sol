// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Interfaces imports
import "../tokens/governance/IGovernanceToken.sol";

interface ICoproperty {

    // Get the address of the syndic in charge of the coproperty contract
    function getSyndic() external view returns (address);

    // Get the governance token of the coproperty
    function getGovernanceToken() external view returns (IGovernanceToken);

    // Get the total number of general assemblies
    function getGeneralAssemblyCount() external view returns (uint256);
}