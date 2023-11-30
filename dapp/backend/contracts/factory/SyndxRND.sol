// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Chainlink imports
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

// Common imports
import "../common/Base.sol";
import "../common/Errors.sol";
import "../common/Constants.sol";

contract SyndxRND is VRFConsumerBaseV2 {

    VRFCoordinatorV2Interface private COORDINATOR;

    address private subscriptionOwner;

    Enums.RandomnessStrategy public randmonessStrategy;

    mapping(address => uint256) internal meetingRequests;

    // 0x56..56 -> 8965

    mapping(uint256 => uint256[]) internal requestedRandomWords;

    // 8965 -> 456488948984

    modifier onlySubscriptionOwner() {
        require(msg.sender == subscriptionOwner);
        _;
    }

    constructor() VRFConsumerBaseV2(Constants.CHAINLINK_VRF_COORDINATOR) {

        COORDINATOR = VRFCoordinatorV2Interface(Constants.CHAINLINK_VRF_COORDINATOR);
        subscriptionOwner = msg.sender;
    }

    function _requestRandomWords(address _meeting) internal {

        // if a fullfilled request already exists for this meeting we revert
        uint256 existingRequestID = meetingRequests[_meeting];
        if (existingRequestID > 0) revert RandomNumberRequestAlreadyFullfilled();

        // Keccak256Based
        if (randmonessStrategy == Enums.RandomnessStrategy.Keccak256Based) {

            uint256 requestID = uint256(keccak256(abi.encodePacked(msg.sender)));
            meetingRequests[_meeting] = requestID;

            for (uint256 i = 0; i < Constants.CHAINLINK_VRF_WORDCOUNT_PER_REQUEST; i++) {

                uint256 randomWord = uint256(keccak256(abi.encodePacked(requestID, block.number)));
                requestedRandomWords[requestID].push(randomWord);
            }

            return;
        }

        // ChainlinkVRF
        if (randmonessStrategy == Enums.RandomnessStrategy.ChainlinkVRF) {

            _requestRandomWordsFromChainlinkVRF(_meeting);
            return;
        }

        revert UnknownRandomnessStrategy();
    }

    // Assumes the subscription is funded sufficiently.
    function _requestRandomWordsFromChainlinkVRF(address _meeting) private {

        // Will revert if subscription is not set and funded.
        
        uint256 requestID = COORDINATOR.requestRandomWords(

            Constants.CHAINLINK_VRF_GASLANE_KEYHASH,
            Constants.CHAINLINK_VRF_SUBSCRIPTION_ID,
            Constants.CHAINLINK_VRF_REQUEST_CONFIRMATIONS,
            Constants.CHAINLINK_VRF_CALLBACK_GAS_LIMIT,
            Constants.CHAINLINK_VRF_WORDCOUNT_PER_REQUEST

        );

        meetingRequests[_meeting] = requestID;  
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {

        uint256[] memory existingWords = requestedRandomWords[requestId];

        if (existingWords.length > 0) revert RandomNumberRequestAlreadyFullfilled();

        requestedRandomWords[requestId] = randomWords;
    }
}