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

/// @title A contract for the co-ownership governance token.
/// @dev Implements IGovernanceToken and extends ERC20 and Ownable for the management of co-ownership tokens.
contract GovernanceToken is IGovernanceToken, ERC20, Ownable {

    /// @notice The ISO of the governance token.
    string private iso;

    /// @notice The administrator of the governance tokens.
    address public administrator;

    /// @notice The whitelist of token holders.
    mapping (address => bool) public whitelist;

    /// @notice Checks if the caller is the contract's administrator.
    /// @dev Restricts access to certain functions to the administrator only.
    modifier onlyAdministrator
    {
        if (msg.sender != administrator) revert NotTokenAdministrator (administrator, msg.sender);
        _;
    }

    /// @notice Emitted when the administrator is set or changed.
    event AdministratorSet(address previousAdministrator, address newAdministrator);

    /// @notice Emitted when a property owner is added.
    event PropertyOwnerAdded(address propertyOwner, uint256 shares);

    /// @notice Emitted when a property owner is removed.
    event PropertyOwnerRemoved(address propertyOwner, uint256 shares);

    /// @notice Creates a new GovernanceToken contract.
    /// @param _iso The ISO of the token.
    /// @param _name The name of the token.
    /// @param _symbol The symbol of the token.
    /// @param _administrator The address of the token's administrator.
    /// @param _owner The address of the contract's owner.
    constructor(string memory _iso, string memory _name, string memory _symbol, address _administrator, address _owner) ERC20(string(_name), string(_symbol)) Ownable(_owner) {
        
        if (_administrator == address(0)) revert AddressZeroNotAllowed();

        if (bytes(_iso).length < TOKEN_ISO_MIN_LENGHT) revert TokenISOTooShort();
        if (bytes(_iso).length > TOKEN_ISO_MAX_LENGHT) revert TokenISOTooLong(); 

        iso = _iso;

        administrator = _administrator;

        _mint(_administrator, PROPERTY_SHARES_MAX_SUPPLY);

        emit AdministratorSet (address(0), _administrator);
    }

    /// @notice Returns the number of decimals of the token.
    /// @dev Overrides the `decimals` function from ERC20 to set decimals to 0.
    /// @return The number of decimals of the token.
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    /// @notice Checks if an address is on the whitelist.
    /// @param _address The address to check.
    /// @return True if the address is on the whitelist, false otherwise.
    function isWhitelistedAddress(address _address) external view returns(bool) {

        return whitelist[_address];
    }

    /// @notice Retrieves the ISO of the token.
    /// @return The ISO of the token as a string.
    function getTokenISO() external view returns(string memory) {
        
        return iso;
    }

    /// @dev Overrides the update function to enforce transfer rules.
    function _update(address from, address to, uint256 amount) internal virtual override {

        // The 'super' keyword is mandatory to call the parent hook
        super._update(from, to, amount);

        // The only addresses allowed to receive tokens are the property share owners and the administrator
        if (to != administrator && whitelist[to] == false) revert NotAuthorizedToReceiveTokens (from, to);

        // The administrator is the only account able to perform transfer between other authorized accounts
        if (whitelist[from] && whitelist[to]) revert TokenTransferUnauthorized (from, to);
    }

    /// @notice Sets the administrator of the governance token contract.
    /// @param _address The address of the new administrator.
    function setAdministrator(address _address) external onlyOwner {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        address previousAdministratorAddress = administrator;

        administrator = _address;

        emit AdministratorSet (previousAdministratorAddress, _address);
    }

    /// @notice Adds a property owner and their property shares.
    /// @param _address The address of the new owner.
    /// @param _propertyShares The number of property shares.
    function addPropertyOwner(address _address, uint256 _propertyShares) external onlyAdministrator {
        
        if (_address == address(0)) revert AddressZeroNotAllowed();

        whitelist[_address] = true;

        uint256 propertyShares = balanceOf(_address);

        if (propertyShares > 0) revert PropertyOwnerAlreadyAdded(_address);

        _transfer(msg.sender, _address, _propertyShares);

        emit PropertyOwnerAdded(_address, _propertyShares);
    }

    /// @notice Removes a property owner and their property shares.
    /// @param _address The address of the owner to remove.
    function removePropertyOwner(address _address) external onlyAdministrator {

        if (_address == address(0)) revert AddressZeroNotAllowed();

        uint256 propertyShares = balanceOf(_address);

        _transfer(_address, msg.sender, propertyShares);

        whitelist[_address] = false;

        emit PropertyOwnerRemoved(_address, propertyShares);
    }
}