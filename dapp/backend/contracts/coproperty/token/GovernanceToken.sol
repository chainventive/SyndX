// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../common/SDX.sol";
import "../../common/constants/constants.sol";
import "../../common/errors/TokenErrors.sol";
import "../../common/errors/AddressErrors.sol";

// Interfaces imports
import "./IGovernanceToken.sol";

contract GovernanceToken is IGovernanceToken, ERC20, Ownable {

    bytes public iso;

    // The token administrator
    address public administrator;

    // The token holders whitelist
    mapping (address => bool) public whitelist;

    // Ensure the caller is the administrator
    modifier onlyAdmininistrator
    {
        if (msg.sender != administrator) revert NotTokenAdministrator (msg.sender);
        _;
    }

    // Emitted when the administrator is set
    event AdministratorSet(address previousAdministrator, address newAdministrator);

    // Emitted when a property owner is added
    event PropertyOwnerAdded(address propertyOwner, uint256 shares);

    // Emitted when a property owner is removed
    event PropertyOwnerRemoved(address propertyOwner, uint256 shares);

    // Emitted when a property shares are transfered from one to another property owner
    event PropertySharesTransfered(address propertyOwnerFrom, address propertyOwnerTo, uint256 shares);

    // The owner of this contract is Syndx in order to keep control of this contract
    // The administrator receive all the token supply and will be in charge to distribute them then
    // Property shares are transfered in bulk as they represent all the tantiems of a property
    // The property shares cannot be transfered directly between property owners and they always pass through the administrator's account
    constructor(bytes memory _iso, bytes memory _name, bytes memory _symbol, address _administrator) ERC20(string(_name), string(_symbol)) Ownable(msg.sender) /*validTokenISO(_iso)*/ {
        
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
    function isWhitelisted(address _address) external view returns(bool) {
        return whitelist[_address];
    }

    // Get the token ISO
    function getTokenISO() external view returns(bytes memory) {
        return iso;
    }

    // Enforce transfer, minting and burning rules
    function _update(address from, address to, uint256 amount) internal virtual override {

        // The 'super' keyword is mandatory to call the parent hook
        super._update(from, to, amount);
        
        // The only addresses allowed to send tokens are the administrator and the address zero (at minting time)
        if (from != address(0) && from != administrator) revert NotAuthorizedToSendTokens (from);

        // The only addresses allowed to receive tokens are the administrator and whitelisted property owners
        if (to != administrator && whitelist[to] == false) revert NotAuthorizedToReceiveTokens (to);
    }

    // Set which account is allowed to manage the coproperty governance token contract 
    function setAdministrator(address _address) external onlyOwner {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        administrator = _address;

        emit AdministratorSet (address(0), _address);
    }

    // Add a property owner and its property shares
    function addPropertyOwner(address _address, uint256 _propertyShares) external onlyAdmininistrator {
        
        if (_address == address(0)) revert AddressZeroNotAllowed();

        whitelist[_address] = true;

        _transfer(msg.sender, _address, _propertyShares);

        emit PropertyOwnerAdded(_address, _propertyShares);
    }

    // Remove a property owner and its property shares
    function removePropertyOwner(address _address) external onlyAdmininistrator {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        uint256 propertyShares = balanceOf(_address);

        _transfer(_address, msg.sender, propertyShares);

        whitelist[_address] = false;

        emit PropertyOwnerRemoved(_address, propertyShares);
    }

    // Transfer the shares of a property owner to another
    function transfertPropertyShares(address _from, address _to) external onlyAdmininistrator {

        if (_from == address(0) || _to == address(0)) revert AddressZeroNotAllowed();
        
        uint256 propertyShares = balanceOf(_from);

        this.removePropertyOwner(_from);

        this.addPropertyOwner(_to, propertyShares);

        emit PropertySharesTransfered(_from, _to, propertyShares);
    }
}