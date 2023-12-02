// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// OpenZippelin imports
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Common imports
import "../../../common/SDX.sol";
import "../../../common/errors/TokenErrors.sol";

// Interfaces imports
import "./IVoteToken.sol";
import "../../token/IGovernanceToken.sol";

contract VoteToken is IVoteToken, ERC20, Ownable {

    IGovernanceToken governanceToken;

    address public administrator;

    uint256 lockupTime;

    mapping (address => bool) public hasClaimed;

    modifier onlyAdmininistrator
    {
        if (msg.sender != administrator) revert NotTokenAdministrator (msg.sender);
        _;
    }

    constructor(IGovernanceToken _governanceToken, address _administrator, bytes memory _name, bytes memory _symbol) ERC20(string(_name), string(_symbol)) Ownable(msg.sender) {
        administrator = _administrator;
        governanceToken = _governanceToken;
    }

    function decimals() public view virtual override returns (uint8) {

        return 0;
    }

    // Set the lockup time after which tokens are not allowed to move
    function setLockupTime (uint256 _lockupTime) external onlyOwner {
        lockupTime = _lockupTime;
    }

    // Burn all tokens for a given address but does not reset its claim status for safety reason
    function burnLostToken(address _address) external onlyAdmininistrator {
        uint256 balance = balanceOf(_address);
        _burn(_address, balance);
    }

    function claimVotingTokens() external {

        if (hasClaimed[msg.sender] == false) revert VoteTokensAlreadyClaimed(msg.sender);

        uint256 copropertyShares = governanceToken.balanceOf(msg.sender);
        if (copropertyShares <= 0) revert PropertySharesBalanceIsZero(msg.sender);

        _mint(msg.sender, copropertyShares);
        hasClaimed[msg.sender] = true;
    }

    // Enforce transfer, minting and burning rules
    function _update(address from, address to, uint256 amount) internal virtual override {

        // The 'super' keyword is mandatory to call the parent hook
        super._update(from, to, amount);

        // Tokens are allowed to moves only before the general assembly lockup
        if (block.timestamp >= lockupTime) revert VoteTokenLockedUp(lockupTime);

        if (msg.sender == administrator) {

            // Vote tokens can be sent to property owners only or the address zero if burn is needed
            if (governanceToken.isWhitelisted(to) == false && to == address(0)) revert NotAuthorizedToReceiveTokens(to);
        }
        else {

            // Property owner are allowed to transfer votes tokens but only between them to enable delegation
            if (governanceToken.isWhitelisted(to) == false) revert NotAuthorizedToReceiveTokens(to);
        }
    }
}