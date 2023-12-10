// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

// Chainlink imports
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

// Common imports
import "../_common/SDX.sol";
import "../_common/constants.sol";
import "../_common/errors/syndxVRF.sol";

// Contracts imports
import "../assembly/IGeneralAssembly.sol";

/// @title SyndxVRF Contract
/// @notice Contract for handling randomness functionalities using Chainlink VRF within the Syndx ecosystem
/// @dev Inherits from VRFConsumerBaseV2 for integrating Chainlink VRF services
contract SyndxVRF is VRFConsumerBaseV2 {

    /// @notice VRFCoordinator interface for interacting with Chainlink VRF
    VRFCoordinatorV2Interface private COORDINATOR;

    /// @notice Chainlink subscription ID used for requesting randomness
    uint64 public chainlinkVrfSubscriptionID;

    /// @notice Address of the subscription owner for the Chainlink VRF account
    address private subscriptionOwner;

    /// @notice Tracks consumer requests for randomness
    mapping(address => SDX.ConsumerRequest) internal consumerRequests;

    /// @notice Tracks responses for consumer requests containing random words
    mapping(uint256 => SDX.ConsumerResponse) internal consumerRequestResponses;

    /// @notice Emitted when random words are requested from Chainlink VRF
    event RandomWordsRequested(uint256 requestId);

    /// @notice Emitted when random words are fulfilled by Chainlink VRF
    event RandomWordsFulfilled(uint256 requestId);

    /// @notice Initializes the SyndxVRF contract with Chainlink VRF coordinator and subscription ID
    /// @param _chainlinkVrfCoordinator Address of the Chainlink VRF Coordinator
    /// @param _chainlinkVrfSubscriptionID Chainlink VRF subscription ID
    constructor(address _chainlinkVrfCoordinator, uint64 _chainlinkVrfSubscriptionID) VRFConsumerBaseV2(_chainlinkVrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_chainlinkVrfCoordinator);
        chainlinkVrfSubscriptionID = _chainlinkVrfSubscriptionID;
        subscriptionOwner = msg.sender;
    }

    /// @notice Internal function to request random words from Chainlink VRF
    /// @dev Assumes the subscription is funded sufficiently
    /// @param _consumer Address of the consumer requesting randomness
    function requestRandomWords(address _consumer) internal {

        // Will revert if subscription is not set and funded.
        uint256 requestID = COORDINATOR.requestRandomWords(

            CHAINLINK_VRF_GASLANE_KEYHASH,
            chainlinkVrfSubscriptionID,
            CHAINLINK_VRF_REQUEST_CONFIRMATIONS,
            CHAINLINK_VRF_CALLBACK_GAS_LIMIT,
            CHAINLINK_VRF_WORDCOUNT_PER_REQUEST
        );

        // Assign the chainlink VRF requestID to the consumer
        consumerRequests[_consumer].requestID = requestID;
        consumerRequests[_consumer].requestBlockNumber = block.number;

        // Assign the consumer address to the request ID
        consumerRequestResponses[requestID].consumer = _consumer;

        emit RandomWordsRequested(requestID);
    }

    /// @notice Callback function used by Chainlink VRF to deliver requested random words
    /// @dev Overrides the VRFConsumerBaseV2 fulfillRandomWords function
    /// @param requestId The ID of the randomness request
    /// @param randomWords Array of random words provided by Chainlink VRF
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {

        // Ensure randomWords are really provided
        if (randomWords.length <= 0) revert EmptyChainlinkRandomWords ();

        // Checks if the consumer already gets random words
        uint256[] memory existingWords = consumerRequestResponses[requestId].randomWords;

        // If yes, revert as Syndx only admit one randomness primitives per consumer
        if (existingWords.length > 0) revert RequestAlreadyFullfilled ();

        // If not, store them
        consumerRequestResponses[requestId].randomWords = randomWords;

        emit RandomWordsFulfilled(requestId);

        // Invoke consumer callback function if there is an existing one
        _invokeConsumerCallback(requestId);
    }

    /// @dev Private function to invoke callback for the consumer after receiving random words
    /// @param requestId The ID of the randomness request
    function _invokeConsumerCallback(uint256 requestId) private {

        // Retrieve the consumer address with its requestID
        address consumerAddress = consumerRequestResponses[requestId].consumer;

        // Identify the type of the consumer
        SDX.ContractType consumerType = consumerRequests[consumerAddress].consumerType;

        // If the consumer type is a general assembly contract, we provide the tiebreaker number directly through its dedicated callback function
        if (consumerType == SDX.ContractType.GeneralAssembly) {

            IGeneralAssembly consumer = IGeneralAssembly(consumerAddress);
            uint256[] memory randomWords = consumerRequestResponses[requestId].randomWords;
            uint256 tiebreaker = randomWords[0];
            consumer.fulfillTiebreaker(tiebreaker);
        }
    }
}