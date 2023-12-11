// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../_common/SDX.sol";
import "../../_common/errors/tokenFactory.sol";

// Interfaces imports
import "./IVoteToken.sol";
import "../governance/IGovernanceToken.sol";

/// @title A vote token contract for a governance system.
/// @dev Inherits from IVoteToken, ERC20, and Ownable to provide voting and ownership functionalities.
/// @notice This contract allows governance token holders to claim vote tokens.
contract VoteToken is IVoteToken, ERC20, Ownable {

    /// @notice Address of the associated governance token.
    IGovernanceToken public governanceToken;

    /// @notice Address of the contract's administrator.
    address public administrator;

    /// @notice Lockup time after which tokens cannot be transferred.
    uint256 public lockupTime;

    /// @notice Records if a user has already claimed vote tokens.
    mapping (address => bool) public hasClaimed;

    /// @notice Checks if the caller is the contract's administrator.
    /// @dev This modifier is used to restrict access to certain functions to the administrator only.
    /// @dev If the caller is not the administrator, the transaction is cancelled, and an error is thrown.
    modifier onlyAdmininistrator {
        if (msg.sender != administrator) revert NotTokenAdministrator (administrator, msg.sender);
        _;
    }

    /// @dev Emitted when the lockup time is set.
    event LockupTimeSet (uint256 lockupTime);

    /// @dev Emitted when vote tokens are claimed.
    event VoteTokensClaimed (address claimer, uint256 amount);

    /// @dev Emitted when lost tokens are burned.
    event LostTokensBurned (address account, uint256 balance);

    /// @notice Creates a new VoteToken contract.
    /// @param _owner Address of the contract owner.
    /// @param _governanceTokenAddress Address of the associated governance token.
    /// @param _administrator Address of the contract's administrator.
    /// @param _name Name of the vote token.
    /// @param _symbol Symbol of the vote token.
    constructor(address _owner, address _governanceTokenAddress, address _administrator, string memory _name, string memory _symbol) ERC20(string(_name), string(_symbol)) Ownable(_owner) {
        administrator = _administrator;
        governanceToken = IGovernanceToken(_governanceTokenAddress);
    }

    /// @notice Returns the number of decimals used for user representation.
    /// @dev Overrides the `decimals` function from ERC20 to set decimals to 0.
    /// @return The number of decimals of the token.
    function decimals() public view virtual override returns (uint8) {

        return 0;
    }

    /// @notice Sets the lockup time after which tokens can no longer move.
    /// @param _lockupTime The lockup time in seconds.
    function setLockupTime (uint256 _lockupTime) external onlyOwner {

        lockupTime = _lockupTime;

        emit LockupTimeSet (_lockupTime);
    }

    /// @notice Allows governance token holders to claim their vote tokens.
    /// @dev Mints vote tokens equivalent to the caller's governance token balance.
    function claimVoteTokens() external {

        if (hasClaimed[msg.sender] == true) revert VoteTokensAlreadyClaimed(msg.sender);

        uint256 copropertyShares = governanceToken.balanceOf(msg.sender);
        if (copropertyShares <= 0) revert PropertySharesBalanceIsZero(msg.sender);

        _mint(msg.sender, copropertyShares);
        hasClaimed[msg.sender] = true;

        emit VoteTokensClaimed (msg.sender, copropertyShares);
    }

    /// @notice Burns all tokens of a given address.
    /// @dev This function is only accessible by the administrator.
    /// @param _account The address whose tokens will be burned.
    function burnLostToken(address _account) external onlyAdmininistrator {

        uint256 balance = balanceOf(_account);

        _burn(_account, balance);

        emit LostTokensBurned (_account, balance);
    }

    /// @dev Overrides the update function to enforce transfer, mint, and burn rules.
    /// @param from The sending address.
    /// @param to The receiving address.
    /// @param amount The amount to transfer.
    function _update(address from, address to, uint256 amount) internal virtual override {

        // The 'super' keyword is mandatory to call the parent hook
        super._update(from, to, amount);

        // Tokens are allowed to moves only before the general assembly lockup
        if (block.timestamp >= lockupTime) revert VoteTokenLockedUp(lockupTime);

        if (msg.sender == administrator) {

            // Vote tokens can be sent to property owners only, or the address zero if burn is needed
            if (governanceToken.isWhitelistedAddress(to) == false && to != address(0)) revert NotAuthorizedToReceiveTokens(from, to);
        }
        else {

            // Property owner are allowed to transfer votes tokens but only between them to enable delegation
            if (governanceToken.isWhitelistedAddress(to) == false) revert NotAuthorizedToReceiveTokens(from, to);
        }
    }
}