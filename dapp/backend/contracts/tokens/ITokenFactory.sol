// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface ITokenFactory {

    function createGovernanceToken(string memory _tokenISO, address _syndic, address _owner) external returns (address);

    function createVoteToken(string memory _tokenISO, uint256 _generalAssemblyID, address _syndic, address _governanceToken) external returns (address);
}