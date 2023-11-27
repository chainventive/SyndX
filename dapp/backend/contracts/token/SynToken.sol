// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../common/Errors.sol";
import "../common/Constants.sol";

// Interfaces imports
import "../token/ISynToken.sol";

contract SynToken is ISynToken, ERC20, Ownable {

    // Address of the syndic in charge of the coproperty
    address public admin;

    // Whitelist of address allowed to use the token. All addresses are blacklisted by default.
    mapping (address => bool) private whitelist;

    // Ensure the caller is the administrator
    modifier onlyAdmin
    {
        if (msg.sender != admin) revert Unauthorized('admin');
        _;
    }

    // The ownership of a coproperty token belongs to the coproperty contract that created it
    // Each property max supply is fixed at 10000 units (1 unit = 1 tantiem)
    // The administrator (i.e the syndic) receive all the token supply and will be in charge to distribute them then
    constructor(string memory _name, string memory _symbol, address _admin) ERC20(_name, _symbol) Ownable(msg.sender) {
        
        uint256 tokenNameLen = bytes(_name).length;
        if (tokenNameLen < Constants.TOKEN_NAME_MIN_LENGHT || tokenNameLen > Constants.TOKEN_NAME_MAX_LENGHT) revert InvalidTokenNameLength();

        uint256 symbolLen = bytes(_symbol).length;
        if (symbolLen < Constants.TOKEN_SYMBOL_MIN_LENGHT || symbolLen > Constants.TOKEN_SYMBOL_MAX_LENGHT) revert InvalidTokenSymbolLength();

        _setAdmin(_admin);

        _mint(_admin, Constants.SYN_TOKEN_TOTAL_SUPPLY);
    }

    function setAdmin(address _address) external onlyOwner {

        _setAdmin(_address);
    }

    function setWhitelist(address _address, bool _allowed) external onlyAdmin {

        _setWhitelist(_address, _allowed);
    }

    function _setAdmin(address _address) private onlyOwner {

        if (_address == address(0)) revert InvalidTokenAdminAdress();
        admin = _address;
    }

    function _setWhitelist(address _address, bool _allowed) private onlyAdmin {

        if (_address == address(0)) revert AddressZeroUnauthorized();
        whitelist[_address] = _allowed;
    }

    // As recommended by OpenZippelin, the 'virtual' keyword is preserved here in order to allow hypothetic child contracts to use the hook
    // Only address zero (at minting time) and admin addresses can send tokens
    // To enable delegation add whitelisted addresses in the condition
    // Only admin and whitelisted addresses can receive tokens. The owner neither the zero address need to receive tokens.
    function _update(address from, address to, uint256 amount) internal virtual override {

        super._update(from, to, amount); // The 'super' keyword is mandatory to call the parent hook
        
        if (from != address(0) && from != admin) revert AddressUnauthorizedToSendToken(from);

        if (to != admin && whitelist[to] == false) revert AddressUnauthorizedToReceiveToken(to);
    }
}