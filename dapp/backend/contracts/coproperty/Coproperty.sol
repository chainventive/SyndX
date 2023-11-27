// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Common imports
import "../common/Errors.sol";
import "../common/Constants.sol";

// Interfaces imports
import "../meeting/IAGMeeting.sol";
import "../factory/ISyndxFactory.sol";

contract Coproperty is Ownable {

    // SyndxFactory
    ISyndxFactory syndxFactory;

    // Coproperty name
    string public name;

    // Address of the syndic in charge of the coproperty
    address syndic;

    // Coproperty token contract
    ISynToken public token;

    // List of all coproperty AG meetings
    IAGMeeting[] private meetings;

    // Registry of all voting contracts
    // Using a mapping here allow the possibility 
    // to add new type of vote contract without beeing 
    // forced to recreated all the syndic contracts infrastructure
    //mapping(string => IVote) votes;

    // Emitted when a new AG meeting is created
    event MeetingCreated(uint256 id, address tokenCotract);

    // Modifier that ensure the caller is the syndic
    modifier onlySyndic () {
        if (msg.sender != syndic) revert Unauthorized('syndic');
        _;
    }
    
    // Syndx keep the ownership of the coproperty
    constructor(address _syndxFactory, string memory _name, string memory _tokenName, string memory _tokenSymbol, address _syndic) Ownable(msg.sender) {

        _injectSyndicFactory(_syndxFactory);
        _setCopropertyName(_name);
        _setSyndicAddress(_syndic);
        _createToken(_tokenName, _tokenSymbol, _syndic);
    }

    function setTokenAdmin(address _admin) external onlyOwner {

        token.setAdmin(_admin);
    }

    function createMeeting() external onlySyndic {

        _createMeeting();
    }

    function _injectSyndicFactory(address _address) private onlyOwner {

        if (_address == address(0)) revert InvalidSyndxFactoryAddress();
        syndxFactory = ISyndxFactory(_address);
    }

    function _setCopropertyName(string memory _name) private {

        uint256 nameLen = bytes(_name).length;
        if (nameLen < Constants.COPRO_NAME_MIN_LENGHT || nameLen > Constants.COPRO_NAME_MAX_LENGHT) revert InvalidCopropertyNameLength();
        name = _name;
    }

    function _setSyndicAddress(address _address) private onlyOwner {

        if (_address == address(0)) revert InvalidSyndicAdress();
        syndic = _address;
    }

    function _createToken(string memory _name, string memory _symbol, address _syndic) private onlyOwner {

        address synTokenAddress = syndxFactory.createSynToken(_name, _symbol, _syndic);
        token = ISynToken(synTokenAddress);
    }

    function _createMeeting() private onlySyndic {

        if (address(token) == address(0)) revert MissingTokenContract();

        address meetingContractAddress = syndxFactory.createMeeting(token);

        meetings.push(IAGMeeting(meetingContractAddress));

        emit MeetingCreated (meetings.length-1, address(token));
    }
}