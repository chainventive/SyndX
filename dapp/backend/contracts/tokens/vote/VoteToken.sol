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

contract VoteToken is IVoteToken, ERC20, Ownable {

    IGovernanceToken public governanceToken;

    address public administrator;

    uint256 public lockupTime;

    mapping (address => bool) private hasClaimed;

    modifier onlyAdmininistrator {
        if (msg.sender != administrator) revert NotTokenAdministrator (administrator, msg.sender);
        _;
    }

    event LockupTimeSet (uint256 lockupTime);
    event VoteTokensClaimed (address claimer, uint256 amount);
    event LostTokensBurned (address account, uint256 balance);

    constructor(address _owner, address _governanceTokenAddress, address _administrator, string memory _name, string memory _symbol) ERC20(string(_name), string(_symbol)) Ownable(_owner) {
        administrator = _administrator;
        governanceToken = IGovernanceToken(_governanceTokenAddress);
    }

    function decimals() public view virtual override returns (uint8) {

        return 0;
    }

    // Set the lockup time after which tokens are not allowed to move
    function setLockupTime (uint256 _lockupTime) external onlyOwner {

        lockupTime = _lockupTime;

        emit LockupTimeSet (_lockupTime);
    }

    function claimVoteTokens() external {

        if (hasClaimed[msg.sender] == true) revert VoteTokensAlreadyClaimed(msg.sender);

        uint256 copropertyShares = governanceToken.balanceOf(msg.sender);
        if (copropertyShares <= 0) revert PropertySharesBalanceIsZero(msg.sender);

        _mint(msg.sender, copropertyShares);
        hasClaimed[msg.sender] = true;

        emit VoteTokensClaimed (msg.sender, copropertyShares);
    }

    // Burn all tokens for a given address but does not reset its claim status for safety reason
    // To provide new vote tokens to a new property address owner the syndic must also remove the old address from governance token contract then add the new one. 
    // After that the property owner will be able to claim again through is new account
    function burnLostToken(address _account) external onlyAdmininistrator {

        uint256 balance = balanceOf(_account);

        _burn(_account, balance);

        emit LostTokensBurned (_account, balance);
    }

    // Enforce transfer, minting and burning rules
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