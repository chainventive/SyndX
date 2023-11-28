// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Enums.sol";
import "../common/Errors.sol";
import "../common/Base.sol";

// Interfaces imports
import "../factory/ISyndxFactory.sol";
import "../token/ISynToken.sol";

// Syndx imports
import "../token/SynToken.sol";
import "../meeting/AGMeeting.sol";


// IL FAUDRA PROTEGER CE CONTRAT CONTRE LE DDOS EN CONTROLANT LES ACCESS
// IL FAUDRA EGALEMENT L'AMELIORER POUR OPTIMISER LE RECOURS A LA CREATION DES CONTRATS.
// PAR EX MEMORIZER SI UN CONTRAT N'EXISTE PAS DEJA POUR UNE COPRO A L'AIDE DE MAPPINGS DE FACON A RENVOYER DIRECTEMENT L'ADRESSE DU CONTRAT EXISTANT PLUTOT QUE DE LE RE-CREER

contract SyndxFactory is ISyndxFactory, Ownable {

    constructor() Ownable(msg.sender) {}

    // Return a SynToken contract
    function getSynToken(string memory _name, string memory _symbol, address _admin) external returns (address) {

        return _createSynToken(_name, _symbol, _admin);
    }

    // Return a AGMeeting contract
    function getMeeting(ISynToken synToken, address _syndic, uint256 _votingStartTime) external returns(address) {
        
        return _createMeeting(synToken, _syndic, _votingStartTime);
    }

    function _createSynToken(string memory _name, string memory _symbol, address _admin) private returns (address) {

        SynToken synToken = new SynToken(_name, _symbol, _admin);

        return address(synToken);
    }

    function _createMeeting(ISynToken synToken, address _syndic,  uint256 _votingStartTime) private returns (address) {
        
        AGMeeting meeting = new AGMeeting(synToken, _syndic, _votingStartTime);

        return address(meeting);
    }
}