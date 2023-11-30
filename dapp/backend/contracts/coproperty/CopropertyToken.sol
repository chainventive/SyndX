// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/SDX.sol";
import "../common/SyndxValidations.sol";

// Interfaces imports
import "./ICopropertyToken.sol";

contract CopropertyToken is ICopropertyToken, SyndxValidations, ERC20, Ownable {

    // The token administrator
    address public administrator;

    // The token holders whitelist
    mapping (address => bool) private whitelist;

    // Ensure the caller is the administrator
    modifier onlyAdmin
    {
        if (msg.sender != administrator) revert ("Your are not the token administrator");
        _;
    }

    // The owner of this contract is Syndx in order to keep control of this contract
    // The administrator receive all the token supply and will be in charge to distribute them then
    constructor(string memory _name, string memory _symbol, address _admin) ERC20(_name, _symbol) Ownable(msg.sender) validTokenName(_name) validTokenSymbol(_symbol) notAddressZero(_admin) {
        _setAdmin(_admin);
        _mint(_admin, PROPERTY_SHARES_MAX_SUPPLY);
    }

    function setWhitelist(address _address, bool _allowed) external onlyAdmin notAddressZero(_address) {

        if (_allowed == false && balanceOf(_address) > 0) revert ("Cannot remove token holder from whitelist");

        whitelist[_address] = _allowed;
    }

    function setAdmin(address _address) external onlyOwner {

        _setAdmin(_address);
    }

    function _setAdmin(address _address) private onlyOwner notAddressZero(_address) {

        administrator = _address;
    }

    // As recommended by OpenZippelin, the 'virtual' keyword is preserved here in order to allow hypothetic child contracts to use the hook
    // Only address zero (at minting time) and admin addresses can send tokens
    // To enable delegation add whitelisted addresses in the condition
    // Only admin and whitelisted addresses can receive tokens. The owner neither the zero address need to receive tokens.
    function _update(address from, address to, uint256 amount) internal virtual override {

        super._update(from, to, amount); // The 'super' keyword is mandatory to call the parent hook
        
        if (from != address(0) && from != administrator) revert AddressUnauthorizedToSendToken(from);

        if (to != administrator && whitelist[to] == false) revert AddressUnauthorizedToReceiveToken(to);
    }
}