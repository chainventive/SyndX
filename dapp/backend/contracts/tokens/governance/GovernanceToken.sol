// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../_common/SDX.sol";
import "../../_common/constants.sol";
import "../../_common/errors/tokenFactory.sol";
import "../../_common/errors/addresses.sol";

// Interfaces imports
import "./IGovernanceToken.sol";

contract GovernanceToken is IGovernanceToken, ERC20, Ownable {

    string private iso;

    // The token administrator
    address public administrator;

    // The token holders whitelist
    mapping (address => bool) public whitelist;

    // Ensure the caller is the administrator
    modifier onlyAdministrator
    {
        if (msg.sender != administrator) revert NotTokenAdministrator (administrator, msg.sender);
        _;
    }

    // Emitted when the administrator is set
    event AdministratorSet(address previousAdministrator, address newAdministrator);

    // Emitted when a property owner is added
    event PropertyOwnerAdded(address propertyOwner, uint256 shares);

    // Emitted when a property owner is removed
    event PropertyOwnerRemoved(address propertyOwner, uint256 shares);

    // The owner of this contract is Syndx in order to keep control of this contract
    // The administrator receive all the token supply and will be in charge to distribute them then
    // Property shares are transfered in bulk as they represent all the tantiems of a property
    // The property shares cannot be transfered directly between property owners and they always pass through the administrator's account
    constructor(string memory _iso, string memory _name, string memory _symbol, address _administrator, address _owner) ERC20(string(_name), string(_symbol)) Ownable(_owner) {
        
        if (_administrator == address(0)) revert AddressZeroNotAllowed();

        if (bytes(_iso).length < TOKEN_ISO_MIN_LENGHT) revert TokenISOTooShort();
        if (bytes(_iso).length > TOKEN_ISO_MAX_LENGHT) revert TokenISOTooLong(); 

        iso = _iso;

        administrator = _administrator;

        _mint(_administrator, PROPERTY_SHARES_MAX_SUPPLY);

        emit AdministratorSet (address(0), _administrator);
    }

    // As there is one token per coproperty share (tantiem) and because thoses shares are indivisibles the token do not need any decimals
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    // Get if an address is whitelisted
    function isWhitelistedAddress(address _address) external view returns(bool) {

        return whitelist[_address];
    }

    // Get the token ISO
    function getTokenISO() external view returns(string memory) {
        
        return iso;
    }

    // Enforce transfer, minting and burning rules
    function _update(address from, address to, uint256 amount) internal virtual override {

        // The 'super' keyword is mandatory to call the parent hook
        super._update(from, to, amount);

        // The only addresses allowed to receive tokens are the property share owners and the administrator
        if (to != administrator && whitelist[to] == false) revert NotAuthorizedToReceiveTokens (from, to);

        // The administrator is the only account able to perform transfer between other authorized accounts
        if (whitelist[from] && whitelist[to]) revert TokenTransferUnauthorized (from, to);
    }

    // Set which account is allowed to manage the coproperty governance token contract 
    function setAdministrator(address _address) external onlyOwner {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        address previousAdministratorAddress = administrator;

        administrator = _address;

        emit AdministratorSet (previousAdministratorAddress, _address);
    }

    // Add a property owner and its property shares
    function addPropertyOwner(address _address, uint256 _propertyShares) external onlyAdministrator {
        
        if (_address == address(0)) revert AddressZeroNotAllowed();

        whitelist[_address] = true;

        uint256 propertyShares = balanceOf(_address);

        if (propertyShares > 0) revert PropertyOwnerAlreadyAdded(_address);

        _transfer(msg.sender, _address, _propertyShares);

        emit PropertyOwnerAdded(_address, _propertyShares);
    }

    // Remove a property owner and its property shares
    function removePropertyOwner(address _address) external onlyAdministrator {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        uint256 propertyShares = balanceOf(_address);

        _transfer(_address, msg.sender, propertyShares);

        whitelist[_address] = false;

        emit PropertyOwnerRemoved(_address, propertyShares);
    }
}